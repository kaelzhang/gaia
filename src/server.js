const grpc = require('grpc')
const {isNumber} = require('core-util-is')

const {
  serverConfig
} = require('./config')
const {Loader} = require('./loader')
const {Application} = require('./application')
const {error} = require('./error')

class Server {
  constructor (rawRoot, rawConfig) {
    const {
      config,
      gaia_path: root
    } = serverConfig(rawRoot, rawConfig)

    this._server = new grpc.Server()
    this._app = new Application()
    this._loader = new Loader({
      app: this._app,
      server: this._server,
      root,
      config
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
  }
}

module.exports = {
  Server
}
