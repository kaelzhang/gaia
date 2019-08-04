const {define} = require('./utils')
const initSingleton = require('./singleton')
const {
  CONFIG, CONTEXT
} = require('./constants')

// The one which will be passed into the factory of a plugin
class Application {
  constructor () {
    define(this, CONTEXT, {
      controller: Object.create(null),
      service: Object.create(null),
      app: Object.create(null)
    })
  }

  addSingleton (name, create) {
    this[CONTEXT].app[name] = initSingleton({
      create,
      name,
      config: this[CONFIG],
      app: this
    })

    delete this[CONFIG]
  }
}

module.exports = {
  Application
}
