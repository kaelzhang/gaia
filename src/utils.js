const PREFIX = 'gaea:'

const symbol = key => Symbol(PREFIX + key)

const define = (host, key, value, writable = false) =>
  Object.defineProperty(host, key, {
    value,
    writable
  })

module.exports = {
  symbol,
  define
}
