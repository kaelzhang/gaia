const {test} = require('piapia')
const path = require('path')

const fixture = sub => path.join(__dirname, 'fixtures', sub)
const hello_root = require.resolve(fixture('hello'))

const {server} = require(hello_root)
delete require.cache[hello_root]

const {client} = require(hello_root)

let Greeter
let Greeter2

test.before(() => {
  server.listen(50051)

  const {
    helloworld
  } = client('localhost:50051')

  /* eslint prefer-destructuring: "off" */
  Greeter = helloworld.Greeter
  Greeter2 = helloworld.Greeter2
})

test.after(() => {
  process.nextTick(() => {
    process.exit()
  })
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

    throw new Error('gaea test: invalid message')
  }

  t.fail('should throw')
}

test('throws: should throws', async t => {
  await throws(
    t,
    () => Greeter2.throws({}),
    err => {
      t.is(err.message, 'custom error')
      t.is(err.code, 'CUSTOM_ERROR')
    }
  )
})

test('throws', async t => {
  await throws(
    t,
    () => Greeter2.throwsNoCode({}),
    err => {
      t.is(err.message, 'custom error without code')
      t.is('code' in err, false)
    }
  )
})

test('rejects', t =>
  Greeter2.rejects({})
  .then(
    () => t.fail('show throw'),
    err => {
      t.is(err.message, 'error rejected')
    }
  )
)
