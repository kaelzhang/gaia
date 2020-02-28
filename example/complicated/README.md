# complicated

Before you dive into this example, it is better that you have read the code of [example `hello`](https://github.com/kaelzhang/gaia/tree/master/example/hello).

In additional to example `hello`, this example will show you:

- How to throw `Error`s, see [`ErrorControl/Throw.js`](https://github.com/kaelzhang/gaia/blob/master/example/complicated/src/controller/ErrorControl/Throw.js)
- Some configurations for gaia server, see [`config.js`](https://github.com/kaelzhang/gaia/blob/master/example/complicated/config.js)
- How to reuse plugins and other gaia services
- How to change default project directory structure

## Start server

```js
// JavaScript
const {Server} = require('gaia')

const config = require('./config')

new Server(__dirname, config).listen(50051)
```

### Why `controller_root` in `config.js` and "gaia.protoPath" in `package.json`

`.proto` files and `package.json` are [portable](https://github.com/kaelzhang/gaia#how-gaia-makes-proto-files-sharable-and-portable) which indicates that they could be used by other languages.

And `controller_root` is only used by the server which must be implemented in a specific language.
