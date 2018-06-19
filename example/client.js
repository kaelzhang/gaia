const {Greeter} = require('./hello').client('localhost:50051')

const run = async () => {
  const {message} = Greeter.sayHello({name: 'world'})

  console.log('Greeting:', message)
}
