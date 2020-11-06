var path = require('path');

const webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
var WebpackNotifierPlugin = require('webpack-notifier');

const getClientEnvironment = require('./env');
// Get environment variables to inject into our app.
var publicUrl = '';
const env = getClientEnvironment(publicUrl);

module.exports = {
  entry: {
    bundle: path.resolve(__dirname, '../src/lib-voyager.tsx'),
  },
  output: {
    filename: "lib-voyager.js",
    path: path.resolve(__dirname, '../build'),
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: 'static/js/[name].chunk.js',
    sourceMapFilename: '[file].map',
    publicPath: '/build/',
    library: 'voyager',
    libraryTarget: 'umd',
  },

  // Enable sourcemaps for debugging webpack's output.
  // If it is inline, it will break CSS sourcemaps because of
  // `extract-text-webpack-plugin`
  devtool: 'source-map',

  devServer: {
    contentBase: path.resolve(__dirname, '../'),
    compress: true,
    host: '0.0.0.0',
    port: 9000
  },

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true
          }
        },
      },
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
                 path.resolve(__dirname, "../node_modules/normalize-scss/sass")
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
        test: /\.(png|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: "url-loader"
      }
    ]
  },

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {
    "react": "react",
    "react-dom": "react-dom",
    "react-css-modules": 'react-css-modules',
    "react-dnd": "react-dnd",
    "react-dnd-html5-backend": "react-dnd-html5-backend",
    "react-redux": "react-redux",
    "react-tether": "react-tether",
    "redux": "redux",
    "redux-thunk": "redux-thunk",
    "redux-undo": "redux-undo",
    "vega": "vega",
    "vega-lite": "vega-lite",
    "vega-tooltip": "vega-tooltip",
    "moment": "moment",
    "font-awesome": "font-awesome",
    "font-awesome-sass-loader": "font-awesome-sass-loader"
  },
  plugins: [
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
    new webpack.DefinePlugin(env.stringified),

    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      output: {
        comments: false,
      },
      sourceMap: true,
    }),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
    new ExtractTextPlugin({
      filename: "style.css",
      disable: false
    }),
    new WebpackNotifierPlugin()
  ],
  // Turn off performance hints during development because we don't do any
  // splitting or minification in interest of speed. These warnings become
  // cumbersome.
  performance: {
    hints: false,
  },
};
