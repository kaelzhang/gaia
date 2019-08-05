const grpc = require('grpc')
const {isNumber} = require('core-util-is')

const {
  serverConfig, checkRoot
} = require('./config')
const {Loader} = require('./loader')
const {Application} = require('./application')

class Server {
  constructor (rawRoot, rawConfig) {
    const root = checkRoot(rawRoot)
    const cfg = serverConfig(root, rawConfig)

    this._server = new grpc.Server()
    this._app = new Application()
    this._loader = new Loader({
      app: this._app,
      server: this._server,
      root,
      config: cfg
    })

    this._loader.load()
  }

  // TODO: more options to define server credentials
  listen (port) {
    if (!isNumber(port)) {
      throw new TypeError(`port must be a number, but got \`${port}\``)
    }

    const server = this._server

    server.bind(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure())
    server.start()
  }
}

module.exports = {
  Server
}
