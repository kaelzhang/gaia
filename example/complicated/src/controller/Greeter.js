exports.sayHello = async function sayHello ({name}) {
  // plugin: egg-bog
  this.app.bog.info('foo')

  // We could call the grpc service `hello` which defined in
  //   `example/hello`
  return this.service.hello.Greeter.sayHello({name})
}
