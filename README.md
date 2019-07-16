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

To make better understanding the usage of `gaea`, the example below will based on the demo in the [`example`](https://github.com/kaelzhang/gaea/tree/master/example) directory.

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

  console.log('Greeting:', message)
}

run()
```

# APIs

## Server(root, config)

- **options**
  - **error_props** `?Array<string>` tells `gaea` which properties of error should be collected, serialized and transmitted to the clients. `error_props` defaults to `['code', 'message']`.
  - **proto_root** `string` specifies where to load proto files.
  - **protos** `?Array<string>` Proto filenames inside `proto_root`. If not specified, gaea will use all `.proto` files inside `proto_root`.

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

### .server(service_root).listen(port)

- **service_root** `string` the directory where `gaea` will search service controllers.
- **port** `number` the port which gRPC server will listen to.

Creates and start the gaea server.

```js
const {server} = g

server('/path/to/example/service').listen(50051)
```

If we have a `foo` package in a proto file, and inside the `foo` package there is a `Bar` service, then we must put a `foo/Bar.js` file in `/path/to/example/service/`.

And if there is a `Baz` rpc method in the `Bar` service, we must set a `Baz` function as one of the exports of the `foo/Bar.js`. The `Baz` function might have one argument(or no arguments) which accepts the data from the client.

Or there will be errors.

Besides, if there is a `Quux` service which not in any package, we should just put a `Quux.js` file in `/path/to/example/service/`.

### .client(host)

- **host** `string` the host string which obeys the `<hostname>:<port>` pattern.

Create the gaea(gRPC) client to connect to the server.

```js
const {client} = g
const {
  helloworld: {Greeter}
} = client('localhost:50051')

const run = async () => {
  try {
    const {message} = await Greeter.sayHello({name: 'world'})
    console.log('Greeting:', message)
  } catch (err) {
    console.log('error', err.code, err.message, err.stack)
  }
}

run()
```

## License

MIT
