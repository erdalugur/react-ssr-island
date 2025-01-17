const webpack = require('webpack');
const { workerData, parentPort } = require('worker_threads');
const { configPath, mode } = workerData;

process.env.NODE_ENV = mode || "production";


const config = require(configPath);
const compiler = webpack(config);
if (mode === 'development') {
  compiler.watch({}, webpackCompilerHandler);
} else {
  compiler.run(webpackCompilerHandler);
}

/**
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