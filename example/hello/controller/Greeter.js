const delay = require('delay')

const sayHello = ({name}) => ({
  message: `Hello ${name}`
})

const delayedSayHello = async call => {
  await delay(300)
  return sayHello(call)
}

module.exports = {
  sayHello,
  delayedSayHello
}
