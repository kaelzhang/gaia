const test = require('ava')
const delay = require('delay')

const {
  example
} = require('./check')

const {
  Server, Client
} = require('../src')

test('kill', async t => {
  const server = new Server(example('hello')).listen(50053)
  const {Greeter} = new Client(example('hello')).connect('localhost:50053')

  const res = Greeter.delayedSayHello({
    name: 'world'
  })

  server.kill()

  await t.throwsAsync(() => res)
})

test('close', async t => {
  const server = new Server(example('hello')).listen(50054)
  const {Greeter} = new Client(example('hello')).connect('localhost:50054')

  const req = Greeter.delayedSayHello({
    name: 'world'
  })

  await delay(50)

  const [, res] = await Promise.all([
    server.close(),
    req
  ])

  t.is(res.message, 'Hello world')
})
