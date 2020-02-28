const {defineGetter} = require('./utils')

defineGetter(exports, 'Server', () => require('./server').Server)
defineGetter(exports, 'Client', () => require('./client').Client)
defineGetter(exports, 'resolvePackage', () => require('./utils').resolvePackage)
