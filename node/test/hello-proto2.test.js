const {join} = require('path')

const testHello = require('./hello')

const {
  createFixture
} = require('./check')

const fixture = createFixture(join(__dirname, 'fixtures', 'example-proto2'))

testHello(fixture, 50053)
