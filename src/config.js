const {shape} = require('skema')
const {resolve} = require('path')
const {isArray, isString} = require('core-util-is')
const glob = require('glob')
const protoLoader = require('@grpc/proto-loader')
const makeArray = require('make-array')

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

const Config = shape({
  proto_root: {
    validate: isString,
    set: p => resolve(p)
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
})

module.exports = config => Config.from(config)
