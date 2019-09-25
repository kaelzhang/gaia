const {join} = require('path')

module.exports = {
  controller_root: join(__dirname, 'src', 'controller'),
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
      path: join(__dirname, '..', 'hello'),
      host: 'localhost:50051'
    }
  }
}
