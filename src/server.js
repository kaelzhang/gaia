const path = require('path')
const debug = require('util').debuglog('gaea')

const grpc = require('grpc')
const {isNumber} = require('core-util-is')

const {wrap} = require('./error-wrapping')
const {iterateProtos} = require('./client')

const STR_DOT = '.'

const packageToPaths = pkg => pkg.split(STR_DOT)

const printError = (message, err) =>
  err && debug(message, err.stack || err.message || err)

const wrapServerMethod = (method, error_props) => (call, callback) => {
  Promise.resolve()
  .then(() => method(call.request, call))
  .then(
    res => callback(null, res),
    err => {
      printError('wrapServerMethod: error: %s', err)

      callback(wrap(err, error_props))
    }
  )
}

class Server {
  constructor (root, options) {
    this._options = options
    this._root = path.resolve(root)
    this._server = new grpc.Server()

    this._init()
  }

  _init () {
    const {
      protos
    } = this._options

    iterateProtos(protos, ({
      service,
      package_name,
      methods
    }) => {
      this._addService(service.service, package_name, methods)
    })
  }

  _getServiceMethods (package_name) {
    const p = path.join(
      this._root,
      ...packageToPaths(package_name)
    )

    try {
      return {
        service_path: p,
        methods: require(p)
      }
    } catch (err) {
      printError('getServiceMethod: error: %s', err)

      // TODO:better error message for different situations
      throw new Error(
        `fails to load service controller "${p}" for "${package_name}"`
      )
    }
  }

  _addService (service, package_name, required_methods) {
    const {
      service_path,
      methods
    } = this._getServiceMethods(package_name)

    const {error_props} = this._options

    const wrapped = {}

    required_methods.forEach(({name, originalName}) => {
      const method = methods[name] || methods[originalName]

      if (!method) {
        throw new Error(`method "${name}" is required in "${service_path}"`)
      }

      wrapped[name] = wrapServerMethod(method, error_props)
    })

    this._server.addService(service, wrapped)
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
