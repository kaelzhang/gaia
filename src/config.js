const {shape} = require('skema')
const path = require('path')
const {isArray, isObject, isString} = require('core-util-is')
const glob = require('glob')
const proto_loader = require('@grpc/proto-loader')

const DEFAULT_LOADER_OPTIONS = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
}

const load = proto_path => {
  try {
    return proto_loader.loadSync(proto_path, DEFAULT_LOADER_OPTIONS)
  } catch (err) {
    throw new Error(`fails to load proto file "${proto_path}": ${err.message}`)
  }
}

function setPath (p) {
  return path.resolve(this.parent.root, p)
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
  protos: {
    default () {
      return glob.sync('*.proto', {
        cwd: this.parent.proto_root,
        mark: true
      })
    },
    set (protos) {
      return protos.map(p => {
        const resolved = path.resolve(this.parent.proto_root, p)

        return {
          path: resolved,
          def: load(resolved)
        }
      })
    }
  }
})

module.exports = abs_root => {
  abs_root = path.resolve(abs_root)
  const config = require(path.join(abs_root, 'config'))

  return Config.from(config, [abs_root])
}
