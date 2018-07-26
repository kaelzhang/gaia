const grpc = require('grpc')

const path = require('path')
const access = require('object-access')
const debug = require('util').debuglog('gaea')
const {isNumber} = require('core-util-is')
const forEach = require('lodash.foreach')

const readConfig = require('./config')
const {wrap, unwrap} = require('./error')

const REGEX_IS_DIR = /\/$/
const STR_JS = '.js'
const STR_DOT = '.'

const isDir = something => !!something && REGEX_IS_DIR.test(something)
const getServiceName_file = filename => path.basename(filename, STR_JS)
const getServiceName_dir = path.basename

class Gaea {
  constructor (root) {
    this._options = readConfig(root)
console.log(this._options.protos)
    this.client = this.client.bind(this)
  }

  client (host) {
    return new Client(host, this._options).create()
  }

  get server () {
    return new Server(this._options)
  }
}

// const getProto = (proto_root, s) => {
//   const proto_path = path.join(proto_root, s.proto)

//   const proto = grpc.loadPackageDefinition(proto_def)

//   if (!s.package) {
//     return proto
//   }

//   const ret = access(proto, s.package)

//   if (!ret) {
//     throw new Error('proto not found')
//   }

//   return ret
// }

// const wrapClientMethods = (real_client, methods, error_props) => {
//   const client = {}

//   Object.keys(methods).forEach(name => {
//     client[name] = req => {
//       return new Promise((resolve, reject) => {
//         real_client[name](req, (err, res) => {
//           if (err) {
//             const error = unwrap(err, error_props)

//             debug('wrapClientMethod: error: %s',
//               error.stack || error.message || error)

//             return reject(error)
//           }

//           resolve(res)
//         })
//       })
//     }
//   })

//   return client
// }

const packageToPaths = pkg => pkg.split(STR_DOT)
const serviceMethodNames = service_def =>
  Object.keys(service_def)
  .map(name => service_def[name].originalName)

const wrapServerMethod = (method, error_props) => {
  return (call, callback) => {
    Promise.resolve()
    .then(() => method(call.request, call))
    .then(
      res => callback(null, res),
      err => {
        debug('wrapServerMethod: error: %s', err && err.stack || err.message || err)

        callback(wrap(err, error_props))
      }
    )
  }
}

class Server {
  constructor (options) {
    this._options = options
    this._server = new grpc.Server()

    this._init()
  }

  _init () {
    const {
      protos,
      error_props
    } = this._options

    protos.forEach(({
      def
    }) => {
      const proto = grpc.loadPackageDefinition(def)

      forEach(def, (
        // Greeter methods
        service_def,
        // 'helloworld.Greeter'
        package_name
      ) => {
        const service = access(proto, package_name)
        const required_methods = serviceMethodNames(service_def)
console.log('required methods', required_methods)
        this._addService(service, package_name, required_methods)
      })
    })
  }

  _getServiceMethods (package_name) {
    const p = path.join(
      this._options.service_root,
      ...packageToPaths(package_name)
    )

    try {
      return {
        service_path: p,
        methods: require(p)
      }
    } catch (err) {
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

    required_methods.forEach(name => {
      if (!(name in methods)) {
        throw new Error(`method "${name}" is required in "${service_path}"`)
      }

      wrapped[name] = wrapServerMethod(methods[name], error_props)
    })

    this._server.addService(service, wrapped)
  }

  listen (port) {
    if (!isNumber(port)) {
      throw new TypeError(`port must be a number, but got \`${port}\``)
    }

    server.bind(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure())
    server.start()
  }
}

// class Client {
//   constructor (host, options) {
//     this._host = host
//     this._options = options
//     this._services = {}
//   }

//   create () {
//     const {
//       services,
//       proto_root
//     } = this._options

//     const clients = {}

//     Object.keys(service).forEach(name => {
//       const s = service[name]
//       const properties = s.package
//         ? s.package.split(STR_DOT).concat(name)
//         : [name]

//       const proto = getProto(proto_root, s)
//       const client = new proto[name](
//         this._host, grpc.credentials.createInsecure())

//       access.set(clients, properties,
//         wrapClientMethods(client, s.methods, this._options.error_props))
//     })

//     return clients
//   }
// }

exports.load = root => new Gaea(root)
