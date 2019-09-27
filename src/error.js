const {Errors} = require('err-object')

const {E, TE, error} = new Errors({
  messagePrefix: '[gaia] '
})

TE('INVALID_ROOT', 'root must be a string')

TE('INVALID_PORT', 'port must be a number')

E('PATH_NOT_DIR', 'path "%s" is not a directory')

E('ERR_READ_PKG', 'fails to read package.json in "%s", reason: %s')

const PKGTE = (code, field, shouldBe) =>
  TE(code, `field "${field}" of "%s" should be ${shouldBe}`)

PKGTE('INVALID_GAIA', 'gaia', 'either undefined or an object')

PKGTE('INVALID_PROTO_PATH', 'gaia.protoPath', 'a string')

PKGTE('INVALID_PROTOS', 'gaia.protos', 'a string or an array of strings')

PKGTE('INVALID_PROTO_DEPS', 'gaia.protoDependencies', 'an array of strings')

PKGTE('INVALID_ERROR_PROPS', 'gaia.errorProps', 'an array of strings')

E('DEP_OUT_RANGE',
  '"%s" of field "gaia.protoDependencies" should be one of the "dependencies" in "%s"',
  RangeError)

TE('INVALID_CONTROLLER_ROOT', 'config.controller_root must be a string')

E('EMPTY_ERROR_PROPS', 'config.error_props must not be an empty array')

E('MODULE_NOT_FOUND', 'fails to resolve package "%s"')

E('SERVICE_PATH_NOT_DIR', 'service path "%s" not found or not a directory')

E('PLUGIN_PATH_NOT_DIR', 'plugin path "%s" not found or not a directory')

E('PACKAGE_OR_PATH_REQUIRED',
  'either %s.package or .path should be speicified')

E('ERR_LOAD_PROTO', 'fails to load proto file "%s", reason: %s')

E('ERR_LOAD_PLUGIN', 'fails to load plugin, reason: %s')

E('ERR_LOAD_CONTROLLER',
  'fails to load service controller "%s" for "%s", reason: %s')

E('RPC_METHOD_NOT_FOUND',
  'rpc method "%s" is required in "%s"')

E('PLUGIN_CLIENT_CONFLICT',
  'can not set config.client and config.clients both for plugin "%s"')

module.exports = {
  error
}
