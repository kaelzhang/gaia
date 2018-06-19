module.exports = {
  sayHello (call) {
    return {
      message: 'Hello ' + call.request.name
    }
  }
}
