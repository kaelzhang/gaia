const {test} = require('piapia')
const hello = require('../example/hello')
const {server, client} = hello

let Greeter

test.before = () => {
  server.start()

  const {
    helloworld
  } = client('localhost:50051')

  Greeter = helloworld.Greeter
}

test.after = () => {
  process.nextTick(() => {
    process.exit()
  })
}

test('sayHello', async t => {
  const {message} = await Greeter.sayHello({name: 'world'})

  t.is(message, 'Hello world')
})
