const test = require('ava')
const path = require('path')

const {
  Server, Client
} = require('../src')

const fixture = (...sub) =>
  path.join(__dirname, '..', 'example', ...sub)

let Throw

test.before(async () => {
  const reject_root = fixture('reject')

  new Server(reject_root).listen(50052)

  const client = new Client(reject_root).connect('localhost:50052')

  // eslint-disable-next-line prefer-destructuring
  Throw = client.ErrorControl.Throw
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
