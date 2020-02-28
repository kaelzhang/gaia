const testHello = require('./hello')

const {
  example: fixture
} = require('./check')

testHello(fixture, 50051)
