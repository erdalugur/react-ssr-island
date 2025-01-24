import webpack, { Stats } from 'webpack';
import { workerData, parentPort } from 'worker_threads';
import createConfig, { ConfigOptions } from './config';
const { isServer, mode, buildId } = workerData as ConfigOptions;

process.env.NODE_ENV = mode || 'production';

const config = createConfig({ isServer, mode, buildId });
const compiler = webpack(config);

if (mode === 'development') {
  compiler.watch({}, webpackCompilerHandler);
} else {
  compiler.run(webpackCompilerHandler);
}

function webpackCompilerHandler(err: Error | null | undefined, stats?: Stats) {
  if (err) {
    parentPort?.postMessage(`Build failed with errors: ${err.message}`);
    process.exit(1);
  } else if (stats?.hasErrors()) {
    parentPort?.postMessage(`Build failed with errors: ${stats.toString('errors-only')}`);
    process.exit(1);
  } else {
    parentPort?.postMessage('Build completed successfully');
  }
}
