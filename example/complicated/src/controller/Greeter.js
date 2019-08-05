exports.sayHello = async function ({name}) {
  return this.service.hello.Greeter.sayHello({name})
}
