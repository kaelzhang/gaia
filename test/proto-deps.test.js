const test = require('ava')

const {
  fixture
} = require('./check')

const {
  Server, Client
} = require('../src')

// `proto-deps` has a deep dependency tree,
// as long as a deep .proto import tree
// Gaia should make it right
test('proto dependencies', async t => {
  const hello_root = fixture('proto-deps')
  new Server(hello_root).listen(50053)

  // eslint-disable-next-line prefer-destructuring
  const {Greeter} = new Client(hello_root)
  .connect('localhost:50053')

  const obj = Object.create(null)

  Object.defineProperty(obj, 'name', {
    get () {
      return 'world'
    },
    enumerable: true
  })

  t.is((await Greeter.sayHello(obj)).message, 'Hello world')
})
