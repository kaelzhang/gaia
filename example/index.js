const path = require('path')
const gaea = require('../src')

module.exports = gaea({
  error_props: ['code', 'message', 'stack'],
  proto_root: path.join(__dirname, 'proto')
})
