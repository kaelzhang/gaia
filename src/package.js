const {join} = require('path')
const {isObject, isString, isArray} = require('core-util-is')
const fs = require('fs-extra')
const {sync} = require('globby')

const {shape} = require('./skema')
const {RETURN} = require('./constants')
const {isArrayString} = require('./utils')
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

const PackageShape = shape({
  // The root of the package
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

  // field gaia in package.json
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
        proto_dependencies: gaia.protoDependencies,
        proto_path: gaia.protoPath,
        protos: gaia.protos,
        error_props: gaia.errorProps
      })

      return gaia
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
    }
  },

  // `protoPath` will be the default --proto-path param to load
  // .proto files
  proto_path: {
    default () {
      return 'proto'
    },
    set (path) {
      const {root} = this.parent

      if (!isString(path)) {
        throw error('INVALID_PROTO_PATH', packagePath(root), path)
      }

      return join(root, path)
    }
  },

  // Globbed paths of proto files
  protos: {
    default: ['*.proto'],
    set (protos) {
      const {proto_path, root} = this.parent
      const patterns = isArray(protos)
        ? protos
        : [protos]

      if (!patterns.every(isString)) {
        throw error('INVALID_PROTOS', packagePath(root), protos)
      }

      return sync(patterns, {
        cwd: proto_path
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
})

module.exports = root => PackageShape.from({root})
