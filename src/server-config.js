const {resolve, join} = require('path')
const {isString} = require('core-util-is')

const {shape, arrayOf, objectOf} = require('./skema')
const {error} = require('./error')
const {
  requireModule, resolvePackage, isDirectory
} = require('./utils')

const ensurePath = errorCode => path => {
  const resolved = resolve(path)

  if (!isDirectory(resolved)) {
    throw error(errorCode, path)
  }

  return resolved
}

const TypePath = code => ({
  optional: true,
  set: ensurePath(code)
})

const TypePackage = type => ({
  enumerable: false,
  when () {
    return !this.parent.path
  },
  default () {},
  set (package_name, gaia_path) {
    if (!package_name) {
      throw error('PACKAGE_OR_PATH_REQUIRED', type)
    }

    // We don't actually use property `package`
    this.parent.path = resolvePackage(gaia_path, package_name)
  }
})

const Plugin = shape({
  config: {
    type: 'object',
    default () {
      return {}
    }
  },

  path: TypePath('PLUGIN_PATH_NOT_DIR'),
  package: TypePackage('plugin')
})

const Plugins = arrayOf(Plugin)

const Service = shape({
  host: {
    type: String
  },

  path: TypePath('SERVICE_PATH_NOT_DIR'),
  package: TypePackage('service')
})

const Services = objectOf(Service)

const ServerConfigShape = shape({
  controller_root: {
    default (gaia_path) {
      return resolve(gaia_path, 'controller')
    },

    validate (value) {
      if (!isString(value)) {
        throw error('INVALID_CONTROLLER_ROOT', value)
      }
    },

    set (value) {
      return resolve(this.parent.root, value)
    }
  },

  plugins: {
    type: Plugins,
    default: () => []
  },

  services: {
    type: Services,
    default: () => ({})
  }
})

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

module.exports = (pkg, serverConfig) => {
  const {gaia_path} = pkg

  serverConfig = serverConfig || readConfig(gaia_path) || {}

  return ServerConfigShape.from(serverConfig, [gaia_path])
}
