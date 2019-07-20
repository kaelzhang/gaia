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

class Application {
  constructor () {

  }

  addSingleton (name, create) {
    new Singleton({
      name, create, app, config
    })
    .init()
  }
}
