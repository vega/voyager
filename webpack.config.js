var path = require('path');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var WebpackNotifierPlugin = require('webpack-notifier');

module.exports = {
  entry: {
    bundle: path.resolve(__dirname, 'src/index.tsx'),
    vendor: [
      // React
      'react-css-modules',
      'react-dnd',
      'react-dnd-html5-backend',
      'react-redux',
      'react-split-pane',
      'redux-thunk',
      'redux-undo',

      'reselect',

      // Other Lib
      'd3',
      'tslib',

      // Vega Dep
      'compassql',
      'vega-lite',
      'vega'
    ]
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/'
  },

  // Enable sourcemaps for debugging webpack's output.
  // If it is inline, it will break CSS sourcemaps because of
  // `extract-text-webpack-plugin`
  devtool: 'source-map',

  devServer: {
    contentBase: __dirname,
    compress: true,
    port: 9000
  },

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },

  module: {
    rules: [
      { test: /\.tsx?$/, use: "ts-loader" },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, use: "source-map-loader", enforce: "pre" },

      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [{
            loader: "css-loader",
            options: {
              sourceMap: true,
              modules: true,
              importLoaders: 2,
              // TODO: use hash in production
              // localIdentName: "[name]__[local]___[hash:base64:5]"
              // Don't use hash in-development, enabling us to edit html directly easily
              localIdentName: "[name]__[local]"
            }
          }, {
            loader: "postcss-loader",
            options: {
              plugins: function () {
                return [
                    require("autoprefixer")
                ];
              }
            }
          }, {
            loader: "sass-loader",
             options: {
               sourceMap: true,
               includePaths: [
                 path.resolve(__dirname, "node_modules/normalize-scss/sass")
               ]
             }
          }]
        })
      },

      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use:  {
          loader: 'url-loader',
          options: {
            limit: 100000,
            mimetype: "application/font-woff"
          }
        }

      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: "file-loader"
      }
    ]
  },

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  },
  plugins: [
    new ExtractTextPlugin({
      filename: "style.css",
      disable: false
    }),
    new WebpackNotifierPlugin()
  ]
};
