exports.sayHello = async function ({name}) {
  // plugin: egg-bog
  this.app.bog.info('foo')

  return this.service.hello.Greeter.sayHello({name})
}
