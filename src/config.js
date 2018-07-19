const {shape, any} = require('skema')
const path = require('path')
const {isArray} = require('core-util-is')

const Config = shape({
  port: Number,
  service_root: {
    type: String,
    default: 'service'
  },
  proto_root: {
    type: String,
    default: 'proto'
  },
  error_props: {
    default: ['code', 'message'],
    validate (props) {
      if (!isArray(props)) {
        throw new TypeError('error_props must be an array of string')
      }

      if (props.length === 0) {
        throw new TypeError('error_props must not be an empty array')
      }

      return true
    }
  }
})

module.exports = absRoot => {
  const config = require(path.join(absRoot, 'config'))
  return Config.from(config)
}
