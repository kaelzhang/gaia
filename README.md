[![Build Status](https://travis-ci.org/kaelzhang/gaea.svg?branch=master)](https://travis-ci.org/kaelzhang/gaea)
[![Coverage](https://codecov.io/gh/kaelzhang/gaea/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/gaea)

# gaea

Gaea, the very framework to make [gRPC](https://grpc.io) services. Gaea defines the way we write gRPC services.

- **Handle Custom Errors** `gRPC` does NOT provide an formal way to handle errors, even lack of documentation, while `gaea` will do it for you.
- **Manage `.proto` files** `gaea` allows us to share proto files between server and clients. `gaea` shares `gPRC` protobuf files by wrapping them into an npm package and publishing the npm tarball to npm registry.
- **Eggjs compatible plugins** `gaea` supports to use [egg plugins](https://github.com/search?q=topic%3Aegg-plugin&type=Repositories) to extend your applications.
- **Restful API service made easy** `gaea` provides a convenient way to define restful API routings upon the existing gRPC services.

## Install

```sh
$ npm i gaea
```

## APIs

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
  // service Greeter
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
  // Configurations for the plugin
  config: object
}

interface Service extends Package {
  // the host param of `client.connect(host)`
  host: string
}

interface Services {
  [name: string]: Service
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

## How `gaea` makes proto files sharable and portable?

`gaea` takes full advantage of npm packages to share proto files.

A minimun `gaea` service portable, as well as service `hello` or package `hello`, could be:

```
/path/to/hello/
  |-- proto/
  |       |-- hello.proto
  |-- package.json
```

And in `proto/hello.proto`:

```protobuf
syntax = "proto3";

service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}
```

package.json

```js
{
  "name": "hello",
  // We need a "gaea" field to tell that it is a gaea portable
  "gaea": {}
}
```

Apparently, package `hello` has everything we need to create a client agent for service `hello`.

### Create the client of `hello`

Assume that we have a new project `foo`, and we `npm install hello`.

```
/path/to/foo/
  |-- proto/
  |        |-- foo.proto
  |-- node_modules/
  |              |-- hello/
  |-- package.json
```

Then if the `hello` service is already running on port `8000`, we could create a hello client by following lines:

```js
const {Client} = require('gaea')
const {Greeter} = new Client('/path/to/foo/node_modules/hello').connect('localhost:8000')
```

### Import `.proto` files from `hello`

Since project `foo`, as we introduced above, has a dependency `hello`, we could import `.proto` files from package `hello`.

/path/to/foo/proto/foo.proto:

```protobuf
syntax = "proto3";

// We could install a package and import things from it
// as well as we do in JavaScript es modules. Oh yeah! 😆
import "hello/proto/hello.proto"

service FooGreeter {
  // We could reuse message types from package `hello`
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}
```

In order to do that, we need to declare that `hello` is a `gaea` dependency of `foo` by adding some fields in package.json:

```js
{
  "name": "foo",
  "gaea": {
    "dependencies": [
      // We have to add "hello" here.
      "hello"
    ]
  },
  "dependencies": {
    // This is generated by `npm install`
    "hello": "^1.0.0"
  }
}
```

And `gaea` will manage the [`--proto_path`](https://developers.google.com/protocol-buffers/docs/proto3#importing-definitions)s ([includeDirs](https://www.npmjs.com/package/@grpc/proto-loader)) for you, so that gRPC Protobuf Loader will know where to search and import `.proto` files

### More about `includeDirs`

## How to write a `gaea` server

## Configurations

A `"gaea"` field is not always required in `package.json`, we could

## License

[MIT](LICENSE)

If we have a `foo` package in a proto file, and inside the `foo` package there is a `Bar` service, then we must put a `foo/Bar.js` file in `/path/to/example/service/`.

And if there is a `Baz` rpc method in the `Bar` service, we must set a `Baz` function as one of the exports of the `foo/Bar.js`. The `Baz` function might have one argument(or no arguments) which accepts the data from the client.

Or there will be errors.

Besides, if there is a `Quux` service which not in any package, we should just put a `Quux.js` file in `/path/to/example/service/`.
