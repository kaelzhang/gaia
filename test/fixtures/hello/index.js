const path = require('path')

const gaea = require('../../..')

module.exports = gaea({
  error_props: ['code', 'message', 'stack'],
  proto_root: path.join(__dirname, 'proto'),
  protos: [
    'helloworld.proto',
    'helloworld2.proto'
  ]
})
