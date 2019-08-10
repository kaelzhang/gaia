const {join} = require('path')

module.exports = {
  error_props: ['code', 'message', 'stack'],
  proto_root: join(__dirname, 'proto'),
  plugins: [
    {
      // Eggjs compatible plugin, installed in package.json
      package: 'egg-bog',
      config: {
        client: {}
      }
    }
  ],
  // gaia services
  services: {
    hello: {
      path: join(__dirname, '..', '..', 'hello'),
      host: 'localhost:50051'
    }
  }
}
