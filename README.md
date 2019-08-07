[![Build Status](https://travis-ci.org/kaelzhang/gaia.svg?branch=master)](https://travis-ci.org/kaelzhang/gaia)
[![Coverage](https://codecov.io/gh/kaelzhang/gaia/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/gaia)

# gaia

Gaia, the very framework to make [gRPC](https://grpc.io) services. Gaia defines the way we write gRPC services.

- **Handle Custom Errors** `gRPC` does NOT provide an formal way to handle errors, even lack of documentation, while `gaia` will do it for you.
- **Manage `.proto` files** `gaia` allows us to share proto files between server and clients. `gaia` shares `gPRC` protobuf files by wrapping them into an npm package and publishing the npm tarball to npm registry.
- **Eggjs compatible plugins** `gaia` supports to use [egg plugins](https://github.com/search?q=topic%3Aegg-plugin&type=Repositories) to extend your applications.
- **Restful API service made easy** `gaia` provides a convenient way to define restful API routings upon the existing gRPC services.

For now, `gaia` only supports [**proto3**](https://developers.google.com/protocol-buffers/docs/proto3).

## Install

```sh
$ npm i gaia
```

## Table of Contents

- [APIs](#apis)
  - [Client](#new-clientroot-clientconfig)
  - [Server](#new-serverroot-serverconfig)
- [How gaia makes `.proto` files sharable and portable?](#how-gaia-makes-proto-files-sharable-and-portable)
  - [Create the client of `hello`](#create-the-client-of-hello)
  - [Import `.proto` files from `hello`](#import-proto-files-from-hello)
  - [More about `includeDirs`](#more-about-includedirs)
- [How to Write a `gaia` Server](#how-to-write-a-gaia-server)
  - [Packages and name resolution](#packages-and-name-resolution)
  - [Reusing other controllers](#reusing-other-controllers)
  - [Using external services](#using-external-services)
  - [Using plugins](#using-plugins)

## Synopsis

```js
const {
  Server, Client
} = require('gaia')

const root = path.join(__dirname, 'example')
```

To make better understanding the usage of `gaia`, the example below is based on the demo in the [`example/hello`](https://github.com/kaelzhang/gaia/tree/master/example/hello) directory.

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

Creates the gaia client.

- **root** `path` the root path to load the client from
- **clientConfig?** `BaseConfig` client configuration. If not specified, `gaia` will load configuration from `${root}/config.js`

```ts
interface BaseConfig {
  // Tells `gaia` which properties of error should be
  // - collected, serialized and transmitted to the clients.
  // - or deseriialized from server
  // `error_props` defaults to `['code', 'message']`
  error_props?: Array<string> = ['code', 'message']
  // specifies where to load proto files.
  proto_root?: string = 'proto'
  // Proto filenames inside `proto_root`.
  // If not specified, gaia will use all `.proto` files inside `proto_root`.
  protos?: Array<string>
}
```

### client.connect(host):

Connects to the gRPC server and returns the service methods

- **host** `string` the server host to connect to which includes the server hostname and port and whose pattern is `<hostname>:<port>`

## new Server(root, serverConfig?)

- **root** `path` the root path to load the server from
- **serverConfig?** `ServerConfig` server configurations. If not specified, `gaia` will load configuration from `${root}/config.js`

```ts
interface ServerConfig extends BaseConfig {
  // Defines where to load controllers
  controller_root?: string = 'controller'
  plugins?: Array<Plugin>
  services?: Services
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
const g = gaia({
  // if the server throws an `error`, gaia will collect
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

Start the gaia server.

## How `gaia` makes `.proto` files sharable and portable?

`gaia` takes full advantage of npm packages to share proto files.

A minimun `gaia` service portable, as well as service `hello` or package `hello`, could be:

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
  // We need a "gaia" field to tell that it is a gaia portable
  "gaia": {}
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
const {Client} = require('gaia')
const {Greeter} = new Client('/path/to/foo/node_modules/hello').connect('localhost:8000')
```

### Import `.proto` files from `hello`

Since project `foo`, as we introduced above, has a dependency `hello`, we could import `.proto` files from package `hello`.

in `/path/to/foo/proto/foo.proto`:

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

In order to do that, we need to declare that `hello` is a `gaia` dependency of `foo` by adding some fields in package.json:

```js
{
  "name": "foo",
  "gaia": {
    // So that we could import .proto files from package `hello`
    "protoDependencies": [
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

And `gaia` will manage the [`--proto_path`](https://developers.google.com/protocol-buffers/docs/proto3#importing-definitions)s ([includeDirs](https://www.npmjs.com/package/@grpc/proto-loader)) for you, so that gRPC Protobuf Loader will know where to search and import `.proto` files

### More about `includeDirs`

`gaia` recursively parses the `protoDependencies` of project `foo`, and its `protoDependency`'s `protoDependencies` to generate the `options.includeDirs` option for [`@grpc/proto-loader`](https://www.npmjs.com/package/@grpc/proto-loader)

## How to Write a `gaia` Server

Take the project `hello` which introduced above for example.

Since we define a `Greeter` service in `hello.proto`, we must implement the corresponding controller by ourselves.

Service controllers should be defined in directory `/path/to/hello/controller` which can be changed with by config `controller_root`.

We must provide a `Greeter.js` in that directory.

```
/path/to/hello/
  |-- controller/
  |            |-- Greeter.js
```

in [`Greeter.js`](example/hello/controller/Greeter.js), there should be an async/sync method named `SayHello` in `exports` because we defined a `SayHello` rpc method in service `Greeter`

```js
exports.sayHello = ({name}) => ({
  message: `Hello ${name}`
})
```

### Packages and name resolution

### Reusing other controllers

### Using external services

### Using plugins

## License

[MIT](LICENSE)
