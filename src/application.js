const {
  symbol,
  define
} = require('./utils')

const LOAD_METHODS = symbol('load-methods')
const APP = symbol('app')
const PATH = symbol('path')
const CONTEXT = symbol('context')
const IS_LOADED = symbol('is-loaded')

class Singleton {
  constructor ({
    name,
    app,
    create
  }) {
    this.name = name
    this.app = app
    this.create = create
  }

  init () {

  }
}

class Controller {
  constructor (app, path) {
    define(this, APP, app)
    define(this, PATH, path)
    define(this, IS_LOADED, false, true)
  }

  [LOAD_METHODS] () {
    if (this[IS_LOADED]) {
      return
    }


  }
}

class ContextApplication {
  constructor () {

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
    new Singleton({
      name, create, app, config
    })
    .init()
  }
}
