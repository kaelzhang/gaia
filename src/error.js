const {Errors} = require('err-object')

const {E, TE, error} = new Errors({
  codePrefix: '[gaea] '
})

TE('INVALID_ROOT', 'root must be a string')

E('ROOT_NO_ACCESSIBLE', 'root "%s" is not accessible or does not exists')

E('ROOT_NOT_DIR', 'root "%s" is not a directory')

TE('INVALID_PROTO_ROOT', 'config.proto_root must be a string')

TE('INVALID_ERROR_PROPS', 'config.error_props must be an array of strings')

E('EMPTY_ERROR_PROPS', 'config.error_props must not be an empty array')

const OR_PATH = ', or service.path should be specified'

E('PACKAGE_JSON_NOT_FOUND',
  `package.json is not found in package "%s${OR_PATH}`)

E('SERVICE_PATH_NOT_DIR', 'service path not found or not a directory')

E('PACKAGE_OR_PATH_REQUIRED',
  'either service.package or service.path should be speicified')

E('NO_PACKAGE_GAEA_PATH',
  `package.json contains no gaea.path in package "%s"${OR_PATH}`)

module.exports = {
  error
}
