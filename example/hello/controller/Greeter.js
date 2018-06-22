exports.methods = {
  sayHello ({
    name
  }) {
    return {
      message: `Hello ${name}`
    }
  }
}

exports.proto = 'helloworld.proto'
exports.package = 'helloworld'
