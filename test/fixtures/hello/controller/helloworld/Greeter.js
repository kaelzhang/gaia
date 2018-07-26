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
  },

  throws () {
    const error = new Error('custom error')
    error.code = 'CUSTOM_ERROR'
    throw error
  },

  throwsNoCode () {
    throw {
      message: 'custom error without code'
    }
  },

  rejects () {
    const error = new Error('error rejected')
    return Promise.reject(error)
  }
}
