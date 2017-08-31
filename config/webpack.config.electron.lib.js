var path = require('path');
var libWebpackConfig = require('./webpack.config.lib.js');

module.exports = Object.assign({}, libWebpackConfig, {
  target: 'electron-renderer',
  output: {
    filename: "lib-voyager-electron.js",
    path: path.resolve(__dirname, '../build'),
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: 'static/js/[name].chunk.js',
    sourceMapFilename: '[file].map',
    publicPath: '/build/',
    library: 'voyager',
    libraryTarget: 'umd',
  }
});
