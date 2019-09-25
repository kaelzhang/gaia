const {defaults, BASIC_TYPES} = require('skema')

module.exports = defaults({
  types: BASIC_TYPES.LOOSE,
  isDefault: (rawParent, key) => rawParent[key] === undefined
})
