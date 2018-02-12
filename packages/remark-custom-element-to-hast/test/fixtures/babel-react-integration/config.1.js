const babel = require('babel-core');

module.exports = {
  componentWhitelist: ['Note'],
  babel: babel,
  babelOptions: {
    presets: ['react',
    ['babel-preset-env', {
      'targets': {
        'browsers': ['last 2 versions', 'safari >= 7']
      }
    }]]
  }
};
