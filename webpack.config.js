// We are using node's native package 'path'
// https://nodejs.org/api/path.html
const path = require('path');
var webpack = require('webpack');
var CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

var PROD = JSON.parse(process.env.PROD_ENV || '0');

// Constant with our paths
const paths = {
  DIST: path.resolve(__dirname, 'dist'),
  SRC: path.resolve(__dirname, 'src'),
  JS: path.resolve(__dirname, 'src/js')
};

// Webpack configuration
module.exports = {
  // devtool: 'source-map',
  entry: path.join(paths.JS, 'app.js'),
  output: {
    path: paths.DIST,
    filename: 'bundle.min.js'
  },
  // index.html is used as a template in which it'll inject bundled app.
  plugins: PROD ? [
    new HtmlWebpackPlugin({
      template: path.join(paths.SRC, 'index.html'),
    }),
    new ExtractTextPlugin('style.bundle.css'), // CSS will be extracted to this bundle file
    new webpack.DefinePlugin({ // <-- key to reducing React's size
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    // new webpack.optimize.DedupePlugin(), //dedupe similar code 
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      comments: false,
      // sourceMap: true,
      minimize: false
    }), //minify everything
    new webpack.optimize.AggressiveMergingPlugin(), //Merge chunks
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ] : [ 
    new HtmlWebpackPlugin({
      template: path.join(paths.SRC, 'index.html'),
    }),
    new ExtractTextPlugin('style.bundle.css'), // CSS will be extracted to this bundle file
  ],
  // Loaders configuration
  // We are telling webpack to use "babel-loader" for .js and .jsx files
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
        ],
      },
      // CSS loader to CSS files
      // Files will get handled by css loader and then passed to the extract text plugin
      // which will write it to the file we defined above
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          use: 'css-loader',
        }),
      },
      // File loader for image assets
      // We'll add only image extensions, but you can things like svgs, fonts and videos
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          'file-loader',
        ],
      }
    ],
  },
  // Dev server configuration
  // Now it uses our "src" folder as a starting point
  // devServer: {
  //   contentBase: paths.SRC,
  // }
  // Enable importing JS files without specifying their's extenstion
  //
  // So we can write:
  // import MyComponent from './my-component';
  //
  // Instead of:
  // import MyComponent from './my-component.jsx';
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};