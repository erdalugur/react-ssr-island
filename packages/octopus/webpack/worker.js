const webpack = require('webpack');
const { workerData, parentPort } = require('worker_threads');
const { configPath, mode } = workerData;
const config = require(configPath);

/**
 * 
 * @param {any} err 
 * @param {webpack.Stats} stats 
 */
function webpackCompilerHandler(err, stats) {
  if (err) {
    parentPort.postMessage(`Build failed with errors: ${stats.toString('errors-only')}`);
    process.exit(1);
  } else {
    parentPort.postMessage('Build completed successfully');
  }
}
const compiler = webpack(config);
if (mode === 'watch') {
  compiler.watch({}, webpackCompilerHandler);
} else {
  compiler.run(webpackCompilerHandler);
}
