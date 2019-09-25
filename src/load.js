const {resolve, dirname} = require('path')
const protoLoader = require('@grpc/proto-loader')

const {error} = require('./error')
const {read} = require('./package')
const {resolvePackage} = require('./utils')

const DEFAULT_LOADER_OPTIONS = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true

  // includeDirs will be injected by gaia
  // includeDirs `Array<string>` A list of search paths for imported .proto files.
}

const load = (proto, includeDirs) => {
  try {
    return protoLoader.loadSync(proto, {
      ...DEFAULT_LOADER_OPTIONS,
      includeDirs
    })
  } catch (err) {
    throw error('ERR_LOAD_PROTO', proto, err.stack)
  }
}

class Dir {
  constructor (path, priority) {
    this.path = path
    this.priority = priority
  }
}

class IncludeDirs {
  constructor () {
    this._dirs = Object.create(null)
  }

  add (path, priority) {
    if (path in this._dirs) {
      const dir = this._dirs[path]
      dir.priority = Math.min(dir.priority, priority)
      return
    }

    this._dirs[path] = new Dir(path, priority)
  }

  values () {
    return Object.values(this._dirs)
    .sort(
      // Smaller means higher
      ({priority: pa}, {priority: pb}) => pa - pb
    )
    .map(({path}) => path)
  }
}

// Get extra includeDirs which are the dirname of dependencies
const getDependencyIncludeDirs = (
  {
    proto_dependencies,
    gaia_path
  },
  priority = 0,
  included = new IncludeDirs(),
  traversed = Object.create(null)
) => {
  for (const dep of proto_dependencies) {
    if (traversed[dep]) {
      continue
    }

    traversed[dep] = true

    // dep: foo -> /path/to/node_modules/foo
    const resolved = resolvePackage(gaia_path, dep)
    // add: /path/to/node_modules
    included.add(dirname(resolved), priority)

    const pkg = read(resolved)

    getDependencyIncludeDirs(pkg, priority + 1, included, traversed)
  }

  if (priority === 0) {
    return included.values()
  }
}

module.exports = pkg => {
  const {proto_path, protos} = pkg

  return protos.map(proto => {
    const resolved = resolve(proto_path, proto)
    const includeDirs = getDependencyIncludeDirs(pkg)

    return {
      path: resolved,
      def: load(proto, [proto_path, ...includeDirs])
    }
  })
}
