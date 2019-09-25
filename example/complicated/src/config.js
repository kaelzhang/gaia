const {join} = require('path')

module.exports = {
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
