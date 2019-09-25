const {resolve, join} = require('path')
const {isString} = require('core-util-is')

const {
  shape,
  arrayOf,
  objectOf
} = require('./skema')
const {error} = require('./error')
const {
  requireModule, resolvePackage, isDirectory
} = require('./utils')
const {read} = require('./package')

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
    set (package_name, gaia_path) {
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
    set (package_name, gaia_path) {
      if (!package_name) {
        throw error('PACKAGE_OR_PATH_REQUIRED', 'service')
      }

      this.parent.path = resolvePackage(gaia_path, package_name)
    }
  }
})

const Services = objectOf(Service)

const SERVER_SHAPE = {
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

const ServerConfigShape = shape(SERVER_SHAPE)

module.exports = (root, serverConfig) => {
  const pkg = read(root)
  const {gaia_path} = pkg

  const config = ServerConfigShape.from(
    serverConfig || readConfig(gaia_path) || {},
    gaia_path
  )

  return {
    pkg,
    config
  }
}
