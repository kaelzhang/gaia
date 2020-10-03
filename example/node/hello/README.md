# Hello

> The simplest gaia server which has all options as defaults

## Example Project Structure

- **proto/** A directory contains protocol buffer files
- **controller/** A directory contains the implementation of gRPC services according to `*.proto` files in `proto/`

Since we have a service `Greeter` in `proto/hello.proto`, then we must define a `Greeter.js` in directory `controller`.

In `controller/Greeter.js`, the `module.exports` object has two methods. To each of the two methods there corresponds a rpc method in `proto/hello.proto`.

## Create a server

```js
// JavaScript
const {Server} = require('gaia')

new Server(__dirname).listen(50051)
```
