[![Build Status](https://travis-ci.org/kaelzhang/gaea.svg?branch=master)](https://travis-ci.org/kaelzhang/gaea)
[![Coverage](https://codecov.io/gh/kaelzhang/gaea/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/gaea)

# gaea

The manager to wrap [grpc](https://grpc.io) services and hold .proto files.

- **Handle Custom Errors** `gRPC` does NOT provide an formal way to handle errors, even lack of documentation, while `gaea` will do it for you.
- **Manage .proto files** `gaea` allows us to share proto files between server and clients. `gaea` shares `gPRC` protobuf files by wrapping them into an npm package and publishing the npm tarball to npm registry.
- **Eggjs compatible plugins** `gaea` supports to use [egg plugins](https://github.com/search?q=topic%3Aegg-plugin&type=Repositories) to extend your applications.
- **Restful API service made easy** `gaea` provides a convenient way to define restful API routings upon the existing gRPC services.

## Install

```sh
$ npm i gaea
```

## Usage

```js
const {
  Server, Client
} = require('gaea')

const root = path.join(__dirname, 'example')
```

To make better understanding the usage of `gaea`, the example below is based on the demo in the [`example/hello`](https://github.com/kaelzhang/gaea/tree/master/example/hello) directory.

Start server:

```js
new Server(root).listen(50051)
```

Run client:

```js
const {
  Greeter
} = new Client(root).connect('localhost:50051')

const run = async () => {
  const {message} = await Greeter.sayHello({name: 'world'})

  console.log(message)
}

run()
// Hello world
```

# APIs

## new Client(root, clientConfig?)

Creates the gaea client.

- **root** `path` the root path to load the client from
- **clientConfig?** `BaseConfig` client configuration. If not specified, `gaea` will load configuration from `${root}/config.js`

```ts
interface BaseConfig {
  // Tells `gaea` which properties of error should be
  // - collected, serialized and transmitted to the clients.
  // - or deseriialized from server
  // `error_props` defaults to `['code', 'message']`
  error_props: Array<string>
  // specifies where to load proto files.
  proto_root: string
  // Proto filenames inside `proto_root`.
  // If not specified, gaea will use all `.proto` files inside `proto_root`.
  protos?: Array<string>
}
```

### client.connect(host):

Connects to the gRPC server and returns the service methods

- **host** `string` the server host to connect to which includes the server hostname and port and whose pattern is `<hostname>:<port>`



## new Server(root, serverConfig?)

- **root** `path` the root path to load the server from
- **serverConfig?** `ServerConfig` server configurations. If not specified, `gaea` will load configuration from `${root}/config.js`

```ts
interface ServerConfig extends BaseConfig {
  plugins: Array<Plugin>
  services: Services
}

interface Package {
  // The root path of the package
  path?: string
  // The package name of the package
  package?: string

  // Either path or package should be defined.
}

interface Plugin extends Package {
  enable: boolean
  // Configurations for the plugin
  config: object
}

interface Services {
  [name: string]: Package
}

```

```js
const g = gaea({
  // if the server throws an `error`, gaea will collect
  // - `error.code`,
  // - `error.message`
  // - `error.stack`,
  // and send them to its clients, while other properties will be omitted.
  error_props: ['code', 'message', 'stack'],
  proto_root: '/path/to/example/proto'

  // and read all .proto files
})
```

### server.listen(port): void

- **port** `number` the port which gRPC server will listen to.

Start the gaea server.

## License

MIT


If we have a `foo` package in a proto file, and inside the `foo` package there is a `Bar` service, then we must put a `foo/Bar.js` file in `/path/to/example/service/`.

And if there is a `Baz` rpc method in the `Bar` service, we must set a `Baz` function as one of the exports of the `foo/Bar.js`. The `Baz` function might have one argument(or no arguments) which accepts the data from the client.

Or there will be errors.

Besides, if there is a `Quux` service which not in any package, we should just put a `Quux.js` file in `/path/to/example/service/`.
