module.exports = {
  // Just throw
  throws () {
    const error = new Error('custom error')
    error.code = 'CUSTOM_ERROR'
    throw error
  },

  // Throw a literal error object is also supported
  throwsNoCode () {
    // eslint-disable-next-line no-throw-literal
    throw {
      message: 'custom error without code'
    }
  },

  // Returns a `Promise.reject`
  rejects () {
    const error = new Error('error rejected')
    return Promise.reject(error)
  }
}
