const {
  shape,
  arrayOf,
  objectOf
} = require('skema')
const {resolve, join} = require('path')
const {isString} = require('core-util-is')
const glob = require('glob')
const protoLoader = require('@grpc/proto-loader')
const makeArray = require('make-array')

const {error} = require('./error')
const {
  requireModule, resolvePackage, isArrayString, isDirectory
} = require('./utils')
const {
  PACKAGE, getIncludeDirs
} = require('./package')

const DEFAULT_LOADER_OPTIONS = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true

  // includeDirs `Array<string>` A list of search paths for imported .proto files.
}

const load = (proto_path, includeDirs) => {
  try {
    return protoLoader.loadSync(proto_path, {
      ...DEFAULT_LOADER_OPTIONS,
      includeDirs
    })
  } catch (err) {
    throw error('ERR_LOAD_PROTO', proto_path, err.stack)
  }
}

const TypeRoot = (default_value, error_code) => ({
  validate (value) {
    if (!isString(value)) {
      throw error(error_code, value)
    }
  },
  default ({gaia_path}) {
    return resolve(gaia_path, default_value)
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
    set (protos, pkg) {
      return makeArray(protos).map((p, i) => {
        if (!isString(p)) {
          throw error('INVALID_PROTO_FILE', i)
        }

        const {proto_root} = this.parent

        const resolved = resolve(proto_root, p)
        const includeDirs = getIncludeDirs(pkg)

        return {
          path: resolved,
          def: load(p, [proto_root, ...includeDirs])
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
    enumerable: false,
    when () {
      return !this.parent.path
    },
    default () {},
    set (package_name, {gaia_path}) {
      if (!package_name) {
        throw error('PACKAGE_OR_PATH_REQUIRED', 'plugin')
      }

      this.parent.path = resolvePackage(gaia_path, package_name)
    }
  }
})

const Plugins = arrayOf(Plugin)

const Service = shape({
  // The path contains gaia service code
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
    set (package_name, {gaia_path}) {
      if (!package_name) {
        throw error('PACKAGE_OR_PATH_REQUIRED', 'service')
      }

      this.parent.path = resolvePackage(gaia_path, package_name)
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

const readConfig = root => {
  const path = join(root, 'config.js')

  try {
    return requireModule(path)
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw error('ERR_LOAD_CONFIG', path, err.stack)
    }
  }
}

const createConfigShape = config_shape => {
  const ConfigShape = shape(config_shape)

  return shape({
    ...PACKAGE,
    config: {
      set (config) {
        const {
          gaia_path,
          pkg
        } = this.parent

        return ConfigShape.from(
          config || readConfig(gaia_path) || pkg.gaia,
          [this.parent]
        )
      }
    }
  })
}

const ClientConfig = createConfigShape(COMMON_SHAPE)
const ServerConfig = createConfigShape(SERVER_SHAPE)

module.exports = {
  serverConfig (root, config) {
    return ServerConfig.from({root, config})
  },

  clientConfig (root, config) {
    return ClientConfig.from({root, config})
  }
}
