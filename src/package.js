const {join} = require('path')
const {isObject, isString, isArray} = require('core-util-is')
const fs = require('fs-extra')
const {sync} = require('globby')

const {shape} = require('./skema')
const {
  RETURN
} = require('./constants')
const {
  isArrayString, isDirectory
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
      const pkg = readPkg(this.parent.root)

      this.rawParent.gaia = pkg.gaia

      return pkg
    }
  },

  gaia: {
    default () {
      return {}
    },
    set (gaia) {
      const {root} = this.parent

      if (!isObject(gaia)) {
        throw error('INVALID_GAIA', packagePath(root), gaia)
      }

      Object.assign(this.rawParent, {
        gaia_path: gaia.path,
        proto_dependencies: gaia.protoDependencies,
        protos: gaia.protos,
        error_props: gaia.errorProps
      })

      return gaia
    }
  },

  // The gaia path could be other than the root path of a npm package
  // by specifying `package.gaia.path`

  // `gaia_path` will be the default --proto-path param to load
  // .proto files
  gaia_path: {
    default: RETURN,
    set (path) {
      const {root} = this.parent

      const gaia_path = path
        // We only allow relative `path` here, so just `path.join`
        ? join(root, path)
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
    default () {
      return []
    },
    validate (deps) {
      const {pkg, root} = this.parent

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

      return true
    },

    // Globbed paths of proto files
    protos: {
      default: ['*.proto'],
      set (protos) {
        const {root} = this.parent
        const patterns = isArray(protos)
          ? protos
          : [protos]

        if (!patterns.every(isString)) {
          throw error('INVALID_PROTOS', packagePath(root), protos)
        }

        return sync(patterns, {
          cwd: root
        })
      }
    },

    error_props: {
      default: ['code', 'message'],
      validate (props) {
        if (!isArrayString(props)) {
          throw error('INVALID_ERROR_PROPS', props)
        }

        if (props.length === 0) {
          throw error('EMPTY_ERROR_PROPS')
        }

        return true
      }
    }
  }
}

const PackageShape = shape(PACKAGE)

const read = root => PackageShape.from({root})

module.exports = {
  read
}
