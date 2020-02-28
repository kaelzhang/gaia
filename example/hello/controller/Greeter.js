// The implementation of `service Greeter` in `proto/hello.proto`
//   which is definitely intuitive.

const delay = require('delay')

// The `helloRequest` here corresponds the `message HelloRequest {}`
//   in `proto/hello.proto`
const sayHello = helloRequest => {

  // `helloReply` corresponds the `message HelloReply {}` in `proto/hello.proto`
  const helloReply = {
    message: `Hello ${helloRequest.name}`
  }

  return helloReply
}

const delayedSayHello = async call => {
  await delay(300)
  return sayHello(call)
}

module.exports = {
  // Corresponds to the rpc method `SayHello` of service `Greeter`
  //   in `proto/hello.proto`

  // Each method could either by an async function or a sync function.
  sayHello,
  // Similar as `sayHello`
  delayedSayHello
}
