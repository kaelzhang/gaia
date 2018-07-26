const {shape} = require('skema')
const path = require('path')
const {isArray, isObject, isString} = require('core-util-is')
const glob = require('glob')

function setPath (p) {
  return path.resolve(this.parent.root, p)
}

function nameToService (name) {
  return {
    proto: path.join(this.parent.proto_root, `${name}.proto`),
    service: path.join(this.parent.service_root, name)
  }
}

function checkService ({
  proto,
  service
}, i) {
  if (!isString(proto)) {
    throw new Error(`invalid config.service[${i}].proto`)
  }

  if (!isString(service)) {
    throw new Error(`invalid config.service[${i}].service`)
  }

  return {
    proto: setPath.call(this, proto),
    service: setPath.call(this, service)
  }
}

const Config = shape({
  root: {
    default (root) {
      return root
    }
  },
  service_root: {
    type: String,
    default: 'service',
    set: setPath
  },
  proto_root: {
    type: String,
    default: 'proto',
    set: setPath
  },
  error_props: {
    default: ['code', 'message'],
    validate (props) {
      if (!isArray(props)) {
        throw new TypeError('config.error_props must be an array of string')
      }

      if (props.length === 0) {
        throw new TypeError('config.error_props must not be an empty array')
      }

      return true
    }
  },
  services: {
    default () {
      const protos = glob.sync('*.proto', {
        cwd: this.parent.proto_root,
        mark: true
      })

      return protos.map(p => path.basename(p, '.proto'))
    },
    set (services) {
      const parsed = services.map((service, i) => {
        if (isString(service)) {
          return nameToService.call(this, service)
        }

        if (isObject(service)) {
          return checkService.call(this, service, i)
        }

        throw new Error(`invalid config.services[${i}]`)
      })

      if (parsed.length === 0) {
        throw new Error('no services found')
      }

      return parsed
    }
  }
})

module.exports = abs_root => {
  abs_root = path.resolve(abs_root)
  const config = require(path.join(abs_root, 'config'))

  return Config.from(config, [abs_root])
}
