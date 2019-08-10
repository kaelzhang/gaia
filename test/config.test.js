const {join} = require('path')
const {
  test, check, fixture
} = require('./check')

const {
  config: {
    serverConfig
  }
} = require('../src')

check(['INVALID_ROOT', () => serverConfig(1)], 'invalid root')

const host = 'localhost:8888'

const SERVER_CONFIG_CASES = [
  ['PATH_NOT_DIR', 'err-not-dir'],
  ['ERR_READ_PKG', 'err-read-pkg'],
  ['PATH_NO_ACCESSIBLE', 'err-path-no-access'],
  ['PATH_NOT_DIR', 'err-gaia-path-not-dir'],

  ['ERR_LOAD_PROTO', 'err-load-proto'],
  ['INVALID_ERROR_PROPS', 'empty', {
    error_props: 1
  }],
  ['EMPTY_ERROR_PROPS', 'empty', {
    error_props: []
  }],
  ['INVALID_PROTO_ROOT', 'empty', {
    proto_root: 1
  }],
  ['INVALID_PROTO_FILE', 'empty', {
    protos: [1]
  }],
  ['PLUGIN_PATH_NOT_DIR', 'empty', {
    plugins: [
      {
        path: fixture('empty', 'not-exists')
      }
    ]
  }],
  ['PACKAGE_OR_PATH_REQUIRED', 'empty', {
    plugins: [{}]
  }],
  ['SERVICE_PATH_NOT_DIR', 'empty', {
    services: {
      foo: {
        host,
        path: fixture('empty', 'not-exists')
      }
    }
  }],
  ['PACKAGE_OR_PATH_REQUIRED', 'empty', {
    services: {
      foo: {
        host
      }
    }
  }],
  ['ERR_LOAD_CONFIG', 'err-load-config'],
  ['MODULE_NOT_FOUND', 'empty', {
    services: {
      foo: {
        host,
        package: 'package-not-found'
      }
    }
  }],
  ['INVALID_PKG_GAIA', 'err-invalid-pkg-gaia'],
  ['INVALID_PROTO_DEPS', 'err-invalid-proto-deps'],
  ['DEP_OUT_RANGE', 'err-dep-out-range']
]

SERVER_CONFIG_CASES.forEach(([code, dir, config], i) => {
  check([code, () => serverConfig(fixture(dir), config)],
    `serverConfig: ${i}: ${code}`)
})

test('config servie package', t => {
  const {config} = serverConfig(fixture('empty'), {
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
