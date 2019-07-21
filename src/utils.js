const PREFIX = 'gaea:'

const symbol = key => Symbol(PREFIX + key)

const define = (host, key, value, writable = false) =>
  Object.defineProperty(host, key, {
    value,
    writable
  })

const defineGetter = (host, key, get) =>
  Object.defineProperty(host, key, {get})

const requireModule = path => {
  // TODO
  // support typescript
  // support esmodule

  const exports = require(path)
  return exports
}

module.exports = {
  symbol,
  define,
  defineGetter,
  requireModule
}
