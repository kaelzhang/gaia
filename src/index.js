const define = (host, key, get) =>
  Object.defineProperty(host, key, {get})

define(exports, 'Server', () => require('./server').Server)
define(exports, 'Client', () => require('./client').Client)
define(exports, 'config', () => require('./config'))
