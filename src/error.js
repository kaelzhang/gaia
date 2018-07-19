const grpc = require('grpc')
const {isString} = require('core-util-is')

const KEY_GAEA = 'is_node_gaea'
const KEY_METADATA = 'metadata'

const get = (metadata, key) => {
  const [ret] = metadata.get(key)
  if (!isString(ret)) {
    return
  }

  return JSON.parse(ret)
}

const set = (metadata, key, value) => {
  metadata.set(key, JSON.stringify(value))
}

exports.wrap = (err, props) => {
  const metadata = new grpc.Metadata()
  set(metadata, KEY_GAEA, true)

  props.forEach(prop => {
    const value = err[prop]
    // `grpc.Metadata` will fail if the value is undefined
    if (value === undefined) {
      return
    }

    set(metadata, prop, value)
  })

  return {
    metadata
  }
}

exports.unwrap = (err, props) => {
  const metadata = err[KEY_METADATA]
  const is_gaea = get(metadata, KEY_GAEA)
  if (!is_gaea) {
    return err
  }

  const unwrapped = Object.create(null)
  props.forEach(prop => {
    const value = get(metadata, prop)
    if (value === undefined) {
      return
    }

    unwrapped[prop] = value
  })

  return unwrapped
}
