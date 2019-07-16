const fs = require('fs')
const {
  shape,
  arrayOf,
  objectOf
} = require('skema')
const {resolve} = require('path')
const {isArray, isString} = require('core-util-is')
const access = require('object-access')
const glob = require('glob')
const protoLoader = require('@grpc/proto-loader')
const makeArray = require('make-array')

const {error} = require('./error')

const DEFAULT_LOADER_OPTIONS = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
}

const load = (proto_path, root) => {
  try {
    return protoLoader.loadSync(proto_path, {
      ...DEFAULT_LOADER_OPTIONS,
      includeDirs: [root]
    })
  } catch (err) {
    throw new Error(`fails to load proto file "${proto_path}": ${err.message}`)
  }
}

const isArrayString = array => !isArray(array) && array.every(isString)

const isDirectory = dir = () => {
  let stat

  try {
    stat = fs.statSync(dir)
  } catch (err) {
    return false
  }

  return stat.isDirectory()
}

const COMMON_SHAPE = {
  proto_root: {
    validate (proto_root) {
      if (!isString(proto_root)) {
        throw error('INVALID_PROTO_ROOT', proto_root)
      }
    },
    default () {
      const {root} = this.parent
      return resolve(root, 'proto')
    },
    set (proto_root) {
      return resolve(this.parent.root, proto_root)
    }
  },

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

  path: () {

  },

  package: {
    set (package_name) {

    }
  }
})

const Services = objectOf(shape({
  path: {
    optional: true,
    validate (package_path) {
      const resolved = resolve(package_path)

      if (!isDirectory(resolved)) {
        throw error('SERVICE_PATH_NOT_DIR', package_path)
      }

      return true
    }
  },

  package: {
    default () {
      return undefined
    },
    validate (package_name) {
      const package_path = this.parent.path
      if (package_path) {
        return undefined
      }

      if (!package_name) {
        throw error('PACKAGE_OR_PATH_REQUIRED')
      }

      let pkg

      try {
        pkg = require(`${package_name}/package.json`)
      } catch (err) {
        if (err.ENOENT) {
          throw error('PACKAGE_JSON_NOT_FOUND', package_name)
        }
      }

      const path = access(pkg, 'gaea.path')
      if (!path) {
        throw error('NO_PACKAGE_GAEA_PATH')
      }

      return path
    }
  }
}))

const SERVER_SHAPE = {
  ...COMMON_SHAPE,

  plugins: arrayOf(),
  services: Services
}

const ServerConfig = shape(COMMON_SHAPE)
const ClientConfig = shape(SERVER_SHAPE)

module.exports = {
  serverConfig (config) {
    return ServerConfig.from(config)
  },

  clientConfig (config) {
    return ClientConfig.from(config)
  },

  root (root) {
    if (!isString(root)) {
      throw error('INVALID_ROOT', root)
    }

    const resolved = resolve(root)

    try {
      fs.accessSync(root, fs.constants.R_OK)
    } catch (err) {
      throw error('ROOT_NO_ACCESSIBLE', root)
    }

    const stat = fs.statSync(resolved)
    if (!stat.isDirectory()) {
      throw error('ROOT_NOT_DIR', root)
    }

    return resolved
  }
}
