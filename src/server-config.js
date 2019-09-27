const {resolve} = require('path')
const {isString} = require('core-util-is')

const {shape, arrayOf, objectOf} = require('./skema')
const {error} = require('./error')
const {
  resolvePackage, isDirectory
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
  set (package_name, root) {
    if (!package_name) {
      throw error('PACKAGE_OR_PATH_REQUIRED', type)
    }

    // We don't actually use property `package`
    this.parent.path = resolvePackage(root, package_name)
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
    default: 'controller',

    set (value, root) {
      if (!isString(value)) {
        throw error('INVALID_CONTROLLER_ROOT', value)
      }

      return resolve(root, value)
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

module.exports = (config, cwd) => ServerConfigShape.from(config, [cwd])
