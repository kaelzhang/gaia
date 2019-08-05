const fs = require('fs-extra')
const {
  shape,
  arrayOf,
  objectOf
} = require('skema')
const {resolve, dirname, join} = require('path')
const {isArray, isString} = require('core-util-is')
const access = require('object-access')
const glob = require('glob')
const protoLoader = require('@grpc/proto-loader')
const makeArray = require('make-array')
const resolveFrom = require('resolve-from')

const {error} = require('./error')

const DEFAULT_LOADER_OPTIONS = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
}

const resolvePackage = (from, package_name) => {
  try {
    const pkgFile = resolveFrom(from, `${package_name}/package.json`)
    return dirname(pkgFile)
  } catch (err) {
    if (err.ENOENT) {
      throw error('PACKAGE_NOT_FOUND', package_name)
    }

    throw err
  }
}

const getGaeaPath = path => {
  let pkg

  try {
    pkg = fs.readJsonSync(join(path, 'package.json'))
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw error('ERR_READ_PKG', path, err.stack)
    }
  }

  const rel_path = pkg && access(pkg, 'gaea.path')

  const gaea_path = rel_path
    ? resolve(path, rel_path)
    : path

  try {
    fs.accessSync(gaea_path, fs.constants.R_OK)
  } catch (err) {
    throw error('PATH_NO_ACCESSIBLE', gaea_path, err.stack)
  }

  const stat = fs.statSync(gaea_path)
  if (!stat.isDirectory()) {
    throw error('PATH_NOT_DIR', gaea_path)
  }

  return gaea_path
}

const load = (proto_path, root) => {
  try {
    return protoLoader.loadSync(proto_path, {
      ...DEFAULT_LOADER_OPTIONS,
      includeDirs: [root]
    })
  } catch (err) {
    throw error('ERR_LOAD_PROTO', proto_path, err.stack)
  }
}

const isArrayString = array => isArray(array) && array.every(isString)

const isDirectory = dir => {
  let stat

  try {
    stat = fs.statSync(dir)
  } catch (err) {
    return false
  }

  return stat.isDirectory()
}

const TypeRoot = (default_value, error_code) => ({
  validate (value) {
    if (!isString(value)) {
      throw error(error_code, value)
    }
  },
  default (root) {
    return resolve(root, default_value)
  },
  set (value) {
    return resolve(this.parent.root, value)
  }
})

const COMMON_SHAPE = {
  proto_root: TypeRoot('proto', 'INVALID_PROTO_ROOT'),

  error_props: {
    default: ['code', 'message'],
    validate (props) {
      if (!isArrayString(props)) {
        throw error('INVALID_ERROR_PROPS', props)
      }

      if (props.length === 0) {
        throw error('EMPTY_ERROR_PROPS')
      }

      return true
    }
  },

  protos: {
    default () {
      return glob.sync('*.proto', {
        cwd: this.parent.proto_root,
        mark: true
      })
    },
    set (protos) {
      return makeArray(protos).map((p, i) => {
        if (!isString(p)) {
          throw new TypeError(`config.protos[${i}] must be a string`)
        }

        const {proto_root} = this.parent

        const resolved = resolve(proto_root, p)

        return {
          path: resolved,
          def: load(p, proto_root)
        }
      })
    }
  }
}

const ensurePath = errorCode => path => {
  const resolved = resolve(path)

  if (!isDirectory(resolved)) {
    throw error(errorCode, path)
  }

  return resolved
}

const Plugin = shape({
  enable: {
    type: 'boolean',
    default: true
  },

  config: {
    type: 'object',
    default () {
      return {}
    }
  },

  path: {
    optional: true,
    set: ensurePath('PLUGIN_PATH_NOT_DIR')
  },

  package: {
    when () {
      return !this.parent.path
    },
    default () {},
    set (package_name, root) {
      if (!package_name) {
        throw error('PACKAGE_OR_PATH_REQUIRED', 'plugin')
      }

      this.parent.path = resolvePackage(root, package_name)
    }
  }
})

const Plugins = arrayOf(Plugin)

const Service = shape({
  // The path contains gaea service code
  path: {
    optional: true,
    set: ensurePath('SERVICE_PATH_NOT_DIR')
  },

  host: {
    type: String
  },

  package: {
    // We don't actually use service.package
    enumerable: false,
    when () {
      return !this.parent.path
    },
    default () {},
    set (package_name, root) {
      if (!package_name) {
        throw error('PACKAGE_OR_PATH_REQUIRED', 'service')
      }

      const pkgRoot = resolvePackage(root, package_name)

      this.parent.path = getGaeaPath(pkgRoot)
    }
  }
})

const Services = objectOf(Service)

const SERVER_SHAPE = {
  ...COMMON_SHAPE,

  controller_root: TypeRoot('controller', 'INVALID_CONTROLLER_ROOT'),
  plugins: {
    type: Plugins,
    default: () => []
  },
  services: {
    type: Services,
    default: () => ({})
  }
}

const ServerConfig = shape(SERVER_SHAPE)
const ClientConfig = shape(COMMON_SHAPE)

module.exports = {
  serverConfig (config, root) {
    return ServerConfig.from(config, [root])
  },

  clientConfig (config, root) {
    return ClientConfig.from(config, [root])
  },

  checkRoot (root) {
    if (!isString(root)) {
      throw error('INVALID_ROOT', root)
    }

    return getGaeaPath(root)
  }
}
