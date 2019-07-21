const {
  symbol,
  define,
  defineGetter,
  requireModule
} = require('./utils')
const {error} = require('./error')

const LOAD_METHODS = symbol('load-methods')
const WRAP_METHOD = symbol('wrap-method')
// const APP = symbol('app')
const PATH = symbol('path')
const CONFIG = symbol('config')
const OPTIONS = symbol('options')
const CONTEXT = symbol('context')
const IS_LOADED = symbol('is-loaded')

class Controller {
  constructor (context, path) {
    define(this, CONTEXT, context)
    define(this, PATH, path)
    define(this, IS_LOADED, false, true)
  }

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

class ContextApplication {
  constructor () {

  }


}

const initSingleton = ({
  create,
  name,
  config,
  app
}) => {
  const {
    client,
    clients
  } = config

  if (client && clients) {
    throw error('CLIENT_CONFLICT', name)
  }

  if (client) {
  }
}

class Application {
  constructor () {
    define(this, CONTEXT, {
      controller: Object.create(null),
      service: Object.create(null),
      app: new ContextApplication()
    })
  }

  addSingleton (name, create) {
    initSingleton({
      create,
      name,
      config: this[CONFIG],
      app: this[CONTEXT].app
    })

    delete this[CONFIG]
  }
}

module.exports = {
  Application
}
