// Client example

const {
  helloworld: {Greeter}
} = require('./hello').client('localhost:50051')

const run = async () => {
  const {message} = await Greeter.sayHello({name: 'world'})

  console.log('Greeting:', message)
}

run()
