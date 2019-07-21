const {
  define,
  symbol
} = require('./utils')
const {error} = require('./error')

const CLIENTS = symbol('clients')
const OPTIONS = symbol('options')
const CREATE_INSTANCE = symbol('create-instance')

class SingletonBase {
  constructor (options) {
    this[OPTIONS] = options
  }

  [CREATE_INSTANCE] (config) {
    const {
      default: defaultConfig,
      create,
      app
    } = this[OPTIONS]

    return create({
      ...defaultConfig,
      ...config
    }, app)
  }
}

class SingletonFactory extends SingletonBase {
  createInstance (config) {
    return this[CREATE_INSTANCE](config)
  }
}

class Singleton extends SingletonBase {
  constructor (options) {
    super(options)

    return this[CREATE_INSTANCE](options.client)
  }
}

class MultiSingleton extends SingletonBase {
  constructor (options) {
    super(options)

    const {
      clients
    } = options

    const map = new Map()

    for (const [id, config] of Object.entries(clients)) {
      map.set(
        id,
        this[CREATE_INSTANCE](config)
      )
    }

    define(this, CLIENTS, map)
  }

  get (id) {
    return this[CLIENTS].get(id)
  }
}

const initSingleton = ({
  create,
  name,
  config,
  app
}) => {
  const {
    client,
    clients
  } = config

  if (client && clients) {
    throw error('CLIENT_CONFLICT', name)
  }

  const options = {
    create,
    app,
    default: config.default
  }

  if (client) {
    return new Singleton({
      client,
      ...options
    })
  }

  if (clients) {
    return new MultiSingleton({
      clients,
      ...options
    })
  }

  return new SingletonFactory(options)
}

module.exports = initSingleton
