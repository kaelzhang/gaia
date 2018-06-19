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

<!-- description -->

## Install

```sh
$ npm install gaea
```

## Usage

index.js

```js
const gaea = require('gaea')

module.exports = gaea.load(__dirname)
```

start.js

```js
const {server} = require('./index')
server.start()
```

```sh
$ node start.js
```

## License

MIT
