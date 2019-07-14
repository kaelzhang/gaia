const {Errors} = require('err-object')

const {E, TE, error} = new Errors({
  codePrefix: '[gaea] '
})

module.exports = {
  error
}
