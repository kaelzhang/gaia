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
    // Then we could use service hello in each controller of
    //   example `complicated`
    // See controller/Greeter.js
    hello: {
      path: join(__dirname, '..', 'hello'),
      host: 'localhost:50051'
    }
  }
}
