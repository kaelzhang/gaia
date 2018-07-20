// Sample server

Error.stackTraceLimit = Infinity

const {server} = require('./hello')

server.listen(50051)
