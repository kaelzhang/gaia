const {join} = require('path')
const log = require('util').debuglog('gaea')
const test = require('ava')

const check = ([code, run], i) => {
  test(String(i), t => {
    try {
      run()
    } catch (err) {
      log(err.stack)
      t.is(err.code, code)
      return
    }

    t.fail('should fail')
  })
}

const fixture = (...sub) => join(__dirname, 'fixtures', ...sub)
const example = (...sub) => join(__dirname, '..', 'example', ...sub)

module.exports = {
  test,
  check,
  fixture,
  example
}
