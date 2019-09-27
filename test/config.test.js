const {join} = require('path')
const {
  test, check, fixture
} = require('./check')

const read = require('../package')
const clean = require('../config')
const load = require('../src/load')

const serverConfig = (root, config) =>
  clean(config || require(join(root, 'config.js')), root)

const loadProto = root => load(read(root))

check(['INVALID_ROOT', () => read(1)], 'invalid root')

const host = 'localhost:8888'

const SERVER_CONFIG_CASES = [
  ['PATH_NOT_DIR', 'err-not-dir', read],
  ['ERR_READ_PKG', 'err-read-pkg', read],
  ['INVALID_GAIA', 'err-invalid-pkg-gaia', read],
  ['ERR_LOAD_PROTO', 'err-load-proto', loadProto],
  ['INVALID_PROTOS', 'err-invalid-protos', read],
  ['INVALID_ERROR_PROPS', 'err-invalid-error-props', read],
  ['EMPTY_ERROR_PROPS', 'err-empty-error-props', read],
  ['INVALID_PROTO_PATH', 'err-invalid-proto-path', read],
  ['PLUGIN_PATH_NOT_DIR', 'empty', serverConfig, {
    plugins: [
      {
        path: fixture('empty', 'not-exists')
      }
    ]
  }],
  ['INVALID_CONTROLLER_ROOT', 'empty', serverConfig, {
    controller_root: 1
  }],
  ['PACKAGE_OR_PATH_REQUIRED', 'empty', serverConfig, {
    plugins: [{}]
  }],
  ['SERVICE_PATH_NOT_DIR', 'empty', serverConfig, {
    services: {
      foo: {
        host,
        path: fixture('empty', 'not-exists')
      }
    }
  }],
  ['PACKAGE_OR_PATH_REQUIRED', 'empty', serverConfig, {
    services: {
      foo: {
        host
      }
    }
  }],
  ['MODULE_NOT_FOUND', 'empty', serverConfig, {
    services: {
      foo: {
        host,
        package: 'package-not-found'
      }
    }
  }],
  ['INVALID_PROTO_DEPS', 'err-invalid-proto-deps', read],
  ['DEP_OUT_RANGE', 'err-dep-out-range', read]
]

SERVER_CONFIG_CASES.forEach(([code, dir, runner = serverConfig, config], i) => {
  check([code, () => runner(fixture(dir), config)],
    `serverConfig: ${i}: ${code}`)
})

test('config servie package', t => {
  const config = serverConfig(fixture('empty'), {
    services: {
      foo: {
        host,
        package: 'egg-bog'
      }
    }
  })

  const path = join(__dirname, '..', 'node_modules', 'egg-bog')

  t.is(config.services.foo.path, path)
})
