const {shape, any} = require('skema')
const path = require('path')

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
    default: []
  }
})

module.exports = absRoot => {
  const config = require(path.join(absRoot, 'config'))
  return Config.from(config)
}
