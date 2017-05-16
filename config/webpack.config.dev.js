'use strict';

const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

// const eslintFormatter = require('react-dev-utils/eslintFormatter');
const getClientEnvironment = require('./env');
const paths = require('./paths');

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
const publicPath = '/';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
const publicUrl = '';
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl);

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
module.exports = {
  // You may want 'eval' instead if you prefer to see the compiled output in DevTools.
  // See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
  devtool: 'cheap-module-source-map',
  // These are the "entry points" to our application.
  // This means they will be the "root" imports that are included in JS bundle.
  // The first two entry points enable "hot" CSS and auto-refreshes for JS.
  entry: [
    // Include an alternative client for WebpackDevServer. A client's job is to
    // connect to WebpackDevServer by a socket and get notified about changes.
    // When you save a file, the client will either apply hot updates (in case
    // of CSS changes), or refresh the page (in case of JS changes). When you
    // make a syntax error, this client will display a syntax error overlay.
    // Note: instead of the default WebpackDevServer client, we use a custom one
    // to bring better experience for Create React App users. You can replace
    // the line below with these two lines if you prefer the stock client:
    // require.resolve('webpack-dev-server/client') + '?/',
    // require.resolve('webpack/hot/dev-server'),
    require.resolve('react-dev-utils/webpackHotDevClient'),
    // We ship a few polyfills by default:
    require.resolve('./polyfills'),
    // Errors should be considered fatal in development
    require.resolve('react-error-overlay'),
    // Finally, this is your app's code:
    paths.appIndexJs,
    // We include the app code last so that if there is a runtime error during
    // initialization, it doesn't blow up the WebpackDevServer client, and
    // changing JS code would still trigger a refresh.
  ],
  output: {
    // Next line is not used in dev but WebpackDevServer crashes without it:
    path: paths.appBuildDev,
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: 'static/js/bundle.js',
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: 'static/js/[name].chunk.js',
    // This is the URL that app is served from. We use "/" in development.
    publicPath: publicPath,
    // Point sourcemap entries to original disk location
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath),
  },
  resolve: {
    // This allows you to set a fallback for where Webpack should look for modules.
    // We read `NODE_PATH` environment variable in `paths.js` and pass paths here.
    // We placed these paths second because we want `node_modules` to "win"
    // if there are any conflicts. This matches Node resolution mechanism.
    // https://github.com/facebookincubator/create-react-app/issues/253
    modules: ['node_modules', paths.appNodeModules].concat(paths.nodePaths),
    // These are the reasonable defaults supported by the Node ecosystem.
    // We also include JSX as a common component filename extension to support
    // some tools, although we do not recommend using it, see:
    // https://github.com/facebookincubator/create-react-app/issues/290

    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".json"],
    alias: {

      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      'react-native': 'react-native-web',
    },
  },
  module: {
    strictExportPresence: true,
    rules: [
      // TODO: Disable require.ensure as it's not a standard language feature.
      // We are waiting for https://github.com/facebookincubator/create-react-app/issues/2176.
      // { parser: { requireEnsure: false } },

      { test: /\.tsx?$/, use: "ts-loader" },

      { test: /\.js$/, use: "source-map-loader", enforce: "pre" },

      // First, run the linter.
      // It's important to do this before Babel processes the JS.
      // {
      //   test: /\.(js|jsx)$/,
      //   enforce: 'pre',
      //   use: [
      //     {
      //       options: {
      //         // formatter: eslintFormatter,
      //
      //       },
      //       loader: require.resolve('eslint-loader'),
      //     },
      //   ],
      //   include: paths.appSrc,
      // },
      // ** ADDING/UPDATING LOADERS **
      // The "url" loader handles all assets unless explicitly excluded.
      // The `exclude` list *must* be updated with every change to loader extensions.
      // When adding a new loader, you must add its `test`
      // as a new entry in the `exclude` list for "url" loader.

      // "file" loader makes sure those assets get served by WebpackDevServer.
      // When you `import` an asset, you get its (virtual) filename.
      // In production, they would get copied to the `build` folder.
      // {
      //   exclude: [
      //     /\.html$/,
      //     /\.(js|jsx)$/,
      //     /\.(ts|tsx)$/,
      //     /\.css$/,
      //     /\.scss/,
      //     /\.json$/,
      //     /\.bmp$/,
      //     /\.gif$/,
      //     /\.jpe?g$/,
      //     /\.png$/,
      //   ],
      //   loader: require.resolve('file-loader'),
      //   options: {
      //     name: 'static/media/[name].[hash:8].[ext]',
      //   },
      // },
      // "url" loader works like "file" loader except that it embeds assets
      // smaller than specified limit in bytes as data URLs to avoid requests.
      // A missing `test` is equivalent to a match.
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
      // Process JS with Babel.
      // {
      //   test: /\.(js|jsx)$/,
      //   include: paths.appSrc,
      //   loader: require.resolve('babel-loader'),
      //   options: {
      //
      //     // This is a feature of `babel-loader` for webpack (not Babel itself).
      //     // It enables caching results in ./node_modules/.cache/babel-loader/
      //     // directory for faster rebuilds.
      //     cacheDirectory: true,
      //   },
      // },
      // "postcss" loader applies autoprefixer to our CSS.
      // "css" loader resolves paths in CSS and adds assets as dependencies.
      // "style" loader turns CSS into JS modules that inject <style> tags.
      // In production, we use a plugin to extract that CSS to a file, but
      // in development "style" loader enables hot editing of CSS.
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
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: "file-loader"
      }
      // ** STOP ** Are you adding a new loader?
      // Remember to add the new extension(s) to the "url" loader exclusion list.
    ],
  },
  plugins: [
    // Makes some environment variables available in index.html.
    // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In development, this will be an empty string.
    new InterpolateHtmlPlugin(env.raw),
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),

    new ExtractTextPlugin({
      filename: "style.css",
      disable: false
    }),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
    new webpack.DefinePlugin(env.stringified),
    // This is necessary to emit hot updates (currently CSS only):
    new webpack.HotModuleReplacementPlugin(),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    // See https://github.com/facebookincubator/create-react-app/issues/186
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  // Turn off performance hints during development because we don't do any
  // splitting or minification in interest of speed. These warnings become
  // cumbersome.
  performance: {
    hints: false,
  },
};
