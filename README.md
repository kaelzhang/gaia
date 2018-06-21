[![Build Status](https://travis-ci.org/kaelzhang/gaea.svg?branch=master)](https://travis-ci.org/kaelzhang/gaea)
[![Coverage](https://codecov.io/gh/kaelzhang/gaea/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/gaea)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/gaea?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/gaea)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/gaea.svg)](http://badge.fury.io/js/gaea)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/gaea.svg)](https://www.npmjs.org/package/gaea)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/gaea.svg)](https://david-dm.org/kaelzhang/gaea)
-->

# gaea

The manager to wrap [grpc](https://grpc.io) services and hold .proto files.

## Install

```sh
$ npm install gaea
```

## Usage

Start server:

```js
const {server} = require('./example/hello')
server.start()
```

Run client:

```js
const {
  helloworld: {Greeter}
} = require('./example/hello').client('localhost:50051')

const run = async () => {
  const {message} = await Greeter.sayHello({name: 'world'})

  console.log('Greeting:', message)
}

run()
```

##

## License

MIT
