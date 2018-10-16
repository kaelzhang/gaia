// Sample server

const path = require('path')
const {server} = require('.')

const service_root = path.join(__dirname, 'service')

server(service_root).listen(50051)
