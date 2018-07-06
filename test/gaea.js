const {test} = require('ava')
const hello = require('../example/hello')
const {server, client} = hello

let Greeter

test.before(() => {
  server.start()

  const {
    helloworld
  } = client('localhost:50051')

  Greeter = helloworld.Greeter
})

test.after(() => {
  process.exit()
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

test('throws: should throws', async t => {
  try {
    await Greeter.throws({})
  } catch (error) {
    t.is(error.message, 'custom error')
    t.is(error.code, 'CUSTOM_ERROR')
    return
  }

  t.fail()
})
