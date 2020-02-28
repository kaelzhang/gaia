const test = require('ava')
const delay = require('delay')
const {join} = require('path')

const {
  Server, Client
} = require('../src')

module.exports = (fixture, port) => {
  let Greeter

  let Throw
  let Greeter2

  test.before(async () => {
    const hello_root = fixture('hello')
    new Server(hello_root).listen(port)

    // eslint-disable-next-line prefer-destructuring
    Greeter = new Client(hello_root)
    .connect(`localhost:${port}`)
    .Greeter

    await delay(100)

    const reject_root = fixture('complicated')
    new Server(
      reject_root,
      require(join(reject_root, 'config.js'))
    ).listen(port + 1)

    const client = new Client(reject_root)
    .connect(`localhost:${port + 1}`)

    // eslint-disable-next-line prefer-destructuring
    Throw = client.ErrorControl.Throw
    Greeter2 = client.Greeter

    await delay(100)
  })

  test('sayHello', async t => {
    const obj = Object.create(null)

    Object.defineProperty(obj, 'name', {
      get () {
        return 'world'
      },
      enumerable: true
    })

    t.is((await Greeter.sayHello(obj)).message, 'Hello world')
    t.is((await Greeter2.sayHello(obj)).message, 'Hello world', 'dep')
  })

  const throws = async (t, fn, message) => {
    try {
      await fn()
    } catch (error) {
      if (typeof message === 'function') {
        message(error)
        return
      }

      if (typeof message === 'string') {
        t.is(error.message, message)
        return
      }

      throw new Error('gaia test: invalid message')
    }

    t.fail('should throw')
  }

  test('throws: should throws', async t => {
    await throws(
      t,
      () => Throw.throws({}),
      err => {
        t.is(err.message, 'custom error')
        t.is(err.code, 'CUSTOM_ERROR')
      }
    )
  })

  test('throws', async t => {
    await throws(
      t,
      () => Throw.throwsNoCode({}),
      err => {
        t.is(err.message, 'custom error without code')
        t.is('code' in err, false)
      }
    )
  })

  test('rejects', t =>
    Throw.rejects({})
    .then(
      () => t.fail('show throw'),
      err => {
        t.is(err.message, 'error rejected')
      }
    )
  )

  test('Rejects', t =>
    Throw.Rejects({})
    .then(
      () => t.fail('show throw'),
      err => {
        t.is(err.message, 'error rejected')
      }
    )
  )
}
