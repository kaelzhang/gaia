const grpc = require('grpc')
const glob = require('glob')
const path = require('path')
const access = require('object-access')

const readConfig = require('./config')

const REGEX_IS_DIR = /\/$/
const STR_JS = '.js'

const isDir = something => !!something && REGEX_IS_DIR.test(something)
const getServiceName_file = filename => path.basename(filename, STR_JS)
const getServiceName_dir = path.basename

exports.load = root => {
  return new Gaea(root)
}

class Gaea {
  constructor (root) {
    this._options = new Options(root)
  }

  get client (host) {
    return new Client(host, this._options).create()
  }

  get server () {
    return new Server(this._options)
  }
}

class Options {
  constructor (root) {
    root = path.resolve(root)
    const c = this.config = readConfig(root)

    this.port = c.port
    this.proto_root = path.join(root, 'proto')
    this.service_root = path.join(root, 'service')
    this._services = null
  }

  get service () {
    if (this._services) {
      return this._services
    }

    const services = this._services = {}
    const children = glob.sync('*', {
      cwd: this._service_root,
      mark: true
    })

    if (children.length === 0) {
      throw new Error('no service found')
    }

    children.forEach(child => {
      const name = isDir(child)
        ? getServiceName_dir(child)
        : getServiceName_file(child)
      const abspath = path.join(this._service_root, child)

      try {
        this._service[name] = require(abspath)
      } catch (e) {
        throw 'todo'
      }
    })
  }
}

const getProto = (proto, package) => {
  if (!package) {
    return proto
  }

  const ret = access(proto, package)

  if (!ret) {
    throw 'todo'
  }

  return ret
}

const wrapServerMethod = method => {
  return (call, callback) => {
    Promise.resolve(method(call))
    .then(
      res => callback(null, res),
      callback
    )
  }
}

const wrapServerMethods = methods => {
  const wrapped = {}
  Object.keys(methods).forEach(name => {
    const method = methods[name]

    wrapped[name] = wrapServerMethod(method)
  })

  return wrapped
}

const wrapClientMethods = (real_client, methods) => {
  const client = {}

  Object.keys(methods).forEach(name => {
    client[name] = req => {
      return new Promise((resolve, reject) => {
        real_client[name](req, (err, res) => {
          if (err) {
            return reject(err)
          }

          resolve(res)
        })
      })
    }
  })

  return client
}

class Server {
  constructor (options) {
    this._options = options
  }

  start () {
    const server = new grpc.Server()
    const {
      service,
      port,
      proto_root
    } = this._options

    Object.keys(service).forEach(name => {
      const s = service[name]
      const proto_path = path.join(proto_root, s.proto)
      const proto = grpc.load(proto_path)

      const dest = getProto(proto, s.package)

      // TODO, treat null
      server.addService(dest[name].service, wrapServerMethods(s.methods))
    })

    server.bind(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure())
    server.start()
  }
}

class Client {
  constructor (host, options) {
    this._host = host
    this._options = options
    this._services = {}
  }

  create () {
    const services = {}
  }
}
