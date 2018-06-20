exports.methods = {
  sayHello (call) {
    return {
      message: 'Hello ' + call.request.name
    }
  }
}

exports.proto = 'helloworld.proto'
exports.package = 'helloworld'
