const {
  check, fixture, example
} = require('./check')
const {
  Server
} = require('../src')

const CHECK_ROOT_CASES = [
  ['ERR_LOAD_PLUGIN', 'empty', {
    plugins: [
      {
        path: fixture('invalid-plugin')
      }
    ]
  }],
  ['ERR_LOAD_CONTROLLER', 'err-controller'],
  ['RPC_METHOD_NOT_FOUND', 'err-rpc-not-found'],
  ['PLUGIN_CLIENT_CONFLICT', 'empty', {
    plugins: [
      {
        package: 'egg-bog',
        config: {
          client: {},
          clients: {}
        }
      }
    ]
  }]
]

CHECK_ROOT_CASES.forEach(([code, dir, config], i) => {
  check([
    code,
    () => new Server(
      fixture(dir),
      config
    )
  ], `new Server() error: ${i}: ${code}`)
})

check([
  'INVALID_PORT',
  () => new Server(example('hello')).listen({})
], 'invalid port')
