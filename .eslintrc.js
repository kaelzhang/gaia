module.exports = {
  extends: require.resolve('@ostai/eslint-config'),
  rules: {
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'import/no-extraneous-dependencies': [
      'error', {
        devDependencies: [
          'node/test/**/*.js'
        ]
      }
    ]
  }
}
