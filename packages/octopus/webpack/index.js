const webpack = require('webpack');

const compiler = webpack([
  require('./configs/client.config.cjs'),
  require('./configs/server.config.cjs')
]);

function webpackCompilerHandler(err, stats) {
  
}

module.exports = {
  build: function () {
    compiler.run(webpackCompilerHandler);
  },
  watch: function () {
    compiler.watch({}, webpackCompilerHandler)
  }
};