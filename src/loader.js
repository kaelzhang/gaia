const {join} = require('path')
const {wrap} = require('./error-wrapping')

const {
  iterateProtos,
  requireModule
} = require('./utils')
const {CONFIG} = require('./constants')

const STR_DOT = '.'

const packageToPaths = pkg => pkg.split(STR_DOT)

const wrapServerMethod = (method, error_props) => (call, callback) => {
  Promise.resolve()
  .then(() => method(call.request, call))
  .then(
    res => callback(null, res),
    err => callback(wrap(err, error_props))
  )
}

class Loader {
  constructor ({
    app,
    root,
    config,
    server
  }) {
    this._app = app
    this._root = root
    this._config = config
    this._server = server
  }

  load () {
    this.loadPlugins()
    this.loadController()
  }

  loadPlugins () {
    const {plugins} = this._config

    plugins.forEach(({
      path,
      enable,
      config
    }) => {
      if (enable === false) {
        return
      }

      this._app[CONFIG] = config

      const entry = join(path, 'app.js')
      let create

      try {
        create = requireModule(entry)
      } catch (error) {
        throw error('ERR_LOAD_PLUGIN')
      }

      create(this._app)

      this._app[CONFIG] = null
    })
  }

  _getServiceMethods (package_name) {
    const p = join(
      this._root,
      ...packageToPaths(package_name)
    )

    try {
      return {
        service_path: p,
        methods: require(p)
      }
    } catch (err) {
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

  loadController () {
    const {protos} = this._config

    iterateProtos(protos, ({
      service,
      package_name,
      methods
    }) => {
      this._addService(service.service, package_name, methods)
    })
  }
}

module.exports = {
  Loader
}
