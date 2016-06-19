var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var rootDir = path.join(__dirname, 'app');

module.exports = {
  context: path.join(rootDir),
  devtool: 'cheap-module-source-map',
  entry: [
    'webpack-dev-server/client?http://localhost:8080',
    'react-hot-loader/patch',
    './scripts/app.js',
  ],
  output: {
    path: path.join(rootDir, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    root: [
      path.join(rootDir, 'scripts'),
    ],
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEV__: true,
    }),
    new HtmlWebpackPlugin({
      title: 'FilePad',
      template: 'index.ejs',
      inject: 'body',
    }),
  ],
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json',
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel',
      },
      {
        test: /\.scss$/,
        loaders: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'file-loader',
      },
    ],
  },
};
