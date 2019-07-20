const path = require('path')

module.exports = {
  error_props: ['code', 'message', 'stack'],
  proto_root: path.join(__dirname, 'proto'),
  protos: [
    'helloworld.proto',
    'helloworld2.proto'
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
  // // gaea services
  // services: {
  //   payment: {
  //     package: '@ostai/payment-service',
  //     // path: require.resolve('@ostai/payment-service')
  //   }
  // }
}
