const webpack = require('webpack');
const { workerData } = require('worker_threads');
const { configPath } = workerData;
const config = require(configPath);
function webpackCompilerHandler(err, stats) {}

webpack(config).run(webpackCompilerHandler)
