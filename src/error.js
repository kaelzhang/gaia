const {Errors} = require('err-object')

const {E, TE, error} = new Errors({
  messagePrefix: '[gaea] '
})

TE('INVALID_ROOT', 'root must be a string')

E('PATH_NO_ACCESSIBLE', 'path "%s" is not accessible, reason: %s')

E('ERR_READ_PKG', 'fails to read package.json in "%s", reason: %s')

E('PATH_NOT_DIR', 'path "%s" is not a directory')

TE('INVALID_PROTO_ROOT', 'config.proto_root must be a string')

TE('INVALID_CONTROLLER_ROOT', 'config.controller_root must be a string')

TE('INVALID_ERROR_PROPS', 'config.error_props must be an array of strings')

E('EMPTY_ERROR_PROPS', 'config.error_props must not be an empty array')

const OR_PATH = ', or service.path should be specified'

E('PACKAGE_NOT_FOUND', 'package "%s" not found')

E('SERVICE_PATH_NOT_DIR', 'service path not found or not a directory')
E('PLUGIN_PATH_NOT_DIR', 'plugin path not found or not a directory')

E('PACKAGE_OR_PATH_REQUIRED',
  'either %s.package or %s.path should be speicified')

E('NO_PACKAGE_GAEA_PATH',
  `package.json contains no gaea.path in package "%s"${OR_PATH}`)

E('ERR_LOAD_PROTO', 'fails to load proto file "%s", reason: %s')

E('ERR_LOAD_CONFIG', 'fails to load config file "%s", reason: %s')

E('ERR_LOAD_PLUGIN', 'fails to load plugin, reason: %s')

E('ERR_LOAD_CONTROLLER',
  'fails to load service controller "%s" for "%s", reason: %s')

E('RPC_METHOD_NOT_FOUND',
  'rpc method "%s" is required in "%s"')

module.exports = {
  error
}
