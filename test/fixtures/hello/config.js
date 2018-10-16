const path = require('path')

module.exports = {
  proto_root: path.join(__dirname, 'proto'),
  error_props: ['code', 'message', 'stack'],
  protos: [
    'helloworld.proto'
  ]
}
