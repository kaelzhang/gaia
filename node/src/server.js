const grpc = require('grpc')
const {isNumber} = require('core-util-is')

const clean = require('./server-config')
const {Loader} = require('./loader')
const {Application} = require('./application')
const {error} = require('./error')
const read = require('./package')

class Server {
  constructor (root, rawConfig = {}) {
    const pkg = read(root)
    const config = clean(rawConfig, root)

    this._server = new grpc.Server()
    this._app = new Application()
    this._loader = new Loader({
      app: this._app,
      server: this._server,
      config,
      pkg
    })

    this._loader.load()
  }

  // TODO: more options to define server credentials
  listen (port) {
    if (!isNumber(port)) {
      throw error('INVALID_PORT', port)
    }

    const server = this._server

    server.bind(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure())
    server.start()
    return this
  }

  kill () {
    this._server.forceShutdown()
  }

  async close () {
    return new Promise(resolve => {
      this._server.tryShutdown(resolve)
    })
  }
}

module.exports = {
  Server
}
