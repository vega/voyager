const esModules = ['vega-lite', 'compassql'].join('|');

module.exports = function (api) {

  // Only execute this file once and cache the resulted config object below for the next babel uses.
  // more info about the babel config caching can be found here: https://babeljs.io/docs/en/config-files#apicache
  api.cache.using(() => process.env.NODE_ENV === "development")

  return {
    presets: [
      '@babel/preset-env'
    ],
    env: {
      test: {
        presets: [
          '@babel/preset-env'
        ],
        plugins: [
          '@babel/plugin-proposal-class-properties',
          'transform-es2015-modules-commonjs',
          'babel-plugin-dynamic-import-node',
        ],

      },
    },
  };

}


// "transformIgnorePatterns": [
//   `/node_modules/(?!${esModules})`,
//   "<rootDir>/dist/",
//   "<rootDir>/build/"
// ]