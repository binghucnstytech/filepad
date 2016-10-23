var WebpackDevServer = require("webpack-dev-server");
var webpack = require("webpack");
var compiler = require('./webpack.config');

var server = new WebpackDevServer(compiler, {
  conntentBase: "http://localhost/",
  hot: true,
  historyApiFallback: false,
  compress: true,
  quiet: false,
  noInfo: false,
  filename: 'bundle.js',
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  publicPath: "/app",
});

server.lister(3000, "localhost", function() {
  console.log
});
