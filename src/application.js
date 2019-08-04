const {
  symbol,
  define,
  defineGetter,
  requireModule
} = require('./utils')
const initSingleton = require('./singleton')
const {CONFIG} = require('./constants')

const LOAD_METHODS = symbol('load-methods')
const WRAP_METHOD = symbol('wrap-method')
// const APP = symbol('app')
const PATH = symbol('path')
const CONTEXT = symbol('context')
const IS_LOADED = symbol('is-loaded')

class Controller {
  // - context: this object for the Controller
  // - path; the filepath of the controller
  constructor (context, path) {
    define(this, CONTEXT, context)
    define(this, PATH, path)
    define(this, IS_LOADED, false, true)
  }

  // Load
  [LOAD_METHODS] () {
    if (this[IS_LOADED]) {
      return
    }

    const exports = requireModule(this[PATH])
    for (const [name, method] of Object.entries(exports)) {
      defineGetter(this, name, this[WRAP_METHOD](method))
    }
  }

  [WRAP_METHOD] (method) {
    return (...args) => method.apply(this[CONTEXT], args)
  }
}

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
  Controller,
  Application
}
