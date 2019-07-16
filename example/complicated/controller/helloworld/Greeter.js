const ENV_KEY = '__gaea_boooom'

if (ENV_KEY in process.env) {
  // Should not load twice
  throw new Error('booooom !!!!')
}

process.env[ENV_KEY] = 1

module.exports = {
  sayHello ({
    name
  }) {
    const obj = Object.create(null)

    Object.defineProperty(obj, 'message', {
      get: () => `Hello ${name}`,
      enumerable: true
    })

    return obj
  }
}
