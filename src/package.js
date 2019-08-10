const {join, dirname} = require('path')
const access = require('object-access')
const {isObject, isString} = require('core-util-is')
const fs = require('fs-extra')
const {shape} = require('skema')

const {
  RETURN, UNDEFINED
} = require('./constants')
const {
  isArrayString, isDirectory, resolvePackage
} = require('./utils')
const {error} = require('./error')

const packagePath = root => join(root, 'package.json')

const readPkg = root => {
  let pkg = {}
  const filepath = packagePath(root)

  try {
    pkg = fs.readJsonSync(filepath)
  } catch (err) {
    if (err.code === 'ENOTDIR') {
      throw error('PATH_NOT_DIR', root)
    }

    if (err.code !== 'ENOENT') {
      throw error('ERR_READ_PKG', root, err.stack)
    }
  }

  const {gaia} = pkg

  // Ensures `pkg.gaia`
  if (!isObject(gaia)) {
    if (gaia === UNDEFINED) {
      pkg.gaia = {}
    } else {
      throw error('INVALID_PKG_GAIA', filepath, gaia)
    }
  }

  return pkg
}

const PACKAGE = {
  root: {
    validate (root) {
      if (!isString(root)) {
        throw error('INVALID_ROOT', root)
      }

      return true
    }
  },

  pkg: {
    default: RETURN,
    // Do not read from config
    set () {
      return readPkg(this.parent.root)
    }
  },

  // The gaia path could be other than the root path of a npm package
  // by specifying `package.gaia.path`

  // `gaia_path` will be the default --proto-path param to load
  // .proto files
  gaia_path: {
    default: RETURN,
    set () {
      const {root} = this.parent
      const rel_path = access(this.parent.pkg, 'gaia.path')

      const gaia_path = rel_path
        // We only allow relative `rel_path` here, so just `path.join`
        ? join(root, rel_path)
        : root

      try {
        fs.accessSync(gaia_path, fs.constants.R_OK)
      } catch (err) {
        throw error('PATH_NO_ACCESSIBLE', gaia_path, err.stack)
      }

      if (!isDirectory(gaia_path)) {
        throw error('PATH_NOT_DIR', gaia_path)
      }

      return gaia_path
    }
  },

  proto_dependencies: {
    default: RETURN,
    set () {
      const {pkg, root} = this.parent
      const deps = access(pkg, 'gaia.protoDependencies', [])

      if (!isArrayString(deps)) {
        throw error('INVALID_PROTO_DEPS', packagePath(root), deps)
      }

      const {
        dependencies = {}
      } = pkg

      for (const dep of deps) {
        if (!(dep in dependencies)) {
          throw error('DEP_OUT_RANGE', dep, packagePath(root))
        }
      }

      return deps
    }
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

const Package = shape(PACKAGE)

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

    const pkg = Package.from({
      root: resolved
    })

    getDependencyIncludeDirs(pkg, priority + 1, included, traversed)
  }

  if (priority === 0) {
    return included.values()
  }
}

module.exports = {
  PACKAGE,
  getDependencyIncludeDirs
}
