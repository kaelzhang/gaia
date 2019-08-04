const {loadPackageDefinition} = require('grpc')
const access = require('object-access')

const PREFIX = 'gaea:'

const symbol = key => Symbol(PREFIX + key)

const define = (host, key, value, writable = false) =>
  Object.defineProperty(host, key, {
    value,
    writable
  })

const defineGetter = (host, key, get) =>
  Object.defineProperty(host, key, {get})

const requireModule = path => {
  // TODO
  // support typescript
  // support esmodule

  const exports = require(path)
  return exports
}

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
      const method_names = serviceMethodNames(service_def)

      iteratee({
        service,
        package_name,
        method_names
      })
    }
  })
}

module.exports = {
  symbol,
  define,
  defineGetter,
  requireModule,
  iterateProtos
}
