const {join} = require('path')
const access = require('object-access')
const {isObject, isString} = require('core-util-is')
const fs = require('fs-extra')

const {
  RETURN, UNDEFINED
} = require('./constants')
const {
  isArrayString, isDirectory
} = require('./utils')
const {error} = require('./error')

const readPkg = root => {
  let pkg = {}

  try {
    pkg = fs.readJsonSync(join(root, 'package.json'))
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
      throw error('INVALID_PKG_GAEA', gaia)
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
        throw error('INVALID_PROTO_DEPS', deps)
      }

      const {
        dependencies = {}
      } = pkg

      for (const dep of deps) {
        if (!(dep in dependencies)) {
          throw error('DEP_OUT_RANGE', dep, root)
        }
      }

      return deps
    }
  }
}

module.exports = {
  PACKAGE
}
