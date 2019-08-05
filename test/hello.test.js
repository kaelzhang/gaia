const test = require('ava')
const path = require('path')

const {
  Server, Client
} = require('../src')

const fixture = (...sub) =>
  path.join(__dirname, '..', 'example', ...sub)

let Greeter

test.before(async () => {
  const hello_root = fixture('hello')

  new Server(hello_root).listen(50051)

  const client = new Client(hello_root).connect('localhost:50051')

  // eslint-disable-next-line prefer-destructuring
  Greeter = client.Greeter
})

test('sayHello', async t => {
  const obj = Object.create(null)

  Object.defineProperty(obj, 'name', {
    get () {
      return 'world'
    },
    enumerable: true
  })

  const {message} = await Greeter.sayHello(obj)

  t.is(message, 'Hello world')
})
