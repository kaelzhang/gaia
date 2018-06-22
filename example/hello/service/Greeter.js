exports.methods = {
  sayHello ({
    name
  }, call) {
    return {
      message: `Hello ${name}`
    }
  }
}

exports.proto = 'helloworld.proto'
exports.package = 'helloworld'
