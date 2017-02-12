var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: "bundle.js",
    path: __dirname + "/dist"
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'cheap-eval-source-map',
  // devtool: "source-map", // this is better for production

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
          use: ["css-loader", "sass-loader"]
        })
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
    })
  ]
};
