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
