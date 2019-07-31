const access = require('object-access')
const {
  credentials,
  loadPackageDefinition
} = require('grpc')

const config = require('./config')
const {unwrap} = require('./error-wrapping')

const serviceMethodNames = service_def =>
  Object.keys(service_def)
  .map(name => {
    const {originalName} = service_def[name]
    return {
      originalName,
      name
    }
  })

const iterateProtos = (protos, iteratee) => {
  protos.forEach(({
    def
  }) => {
    const grpc_object = loadPackageDefinition(def)

    for (const [
      // 'helloworld.Greeter'
      package_name,
      // Greeter methods
      service_def
    ] of Object.entries(def)) {
      // If has service_def.format,
      // then the object is a protobuf Message, but not a Service
      if (service_def.format) {
        continue
      }

      const service = access(grpc_object, package_name)
      const methods = serviceMethodNames(service_def)

      iteratee({
        service,
        package_name,
        methods
      })
    }
  })
}

const wrapClientMethods = (real_client, methods, error_props) => {
  const client = {}

  methods.forEach(({name, originalName}) => {
    const method = req => new Promise((resolve, reject) => {
      real_client[name](req, (err, res) => {
        if (err) {
          const error = unwrap(err, error_props)

          return reject(error)
        }

        resolve(res)
      })
    })

    client[name] = method

    if (name !== originalName) {
      client[originalName] = method
    }
  })

  return client
}

class Client {
  constructor (root, rawConfig = {}) {
    this._config = config.client(rawConfig, config.root(root))
  }

  connect (host) {
    const {
      protos,
      error_props
    } = this._config

    const clients = {}

    iterateProtos(protos, ({
      service: Service,
      package_name,
      methods
    }) => {
      const client = new Service(host, credentials.createInsecure())

      access.set(
        clients, package_name,
        wrapClientMethods(client, methods, error_props)
      )
    })

    return clients
  }
}

module.exports = {
  Client,
  iterateProtos
}
