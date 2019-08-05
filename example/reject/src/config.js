const {join} = require('path')

module.exports = {
  error_props: ['code', 'message', 'stack'],
  proto_root: join(__dirname, 'proto'),
  protos: [
    'emptyMessage.proto',
    'throws.proto'
  ],
  plugins: [
    {
      // defaults to true
      enable: true,
      config: {

      },
      package: 'egg-mysql',
      // path: require.resolve('egg-mysql')
    }
  ],
  // gaea services
  services: {
    greeter: {
      path: join(__dirname, '..', 'hello')
    }
  }
}
