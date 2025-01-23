import webpack, { Stats } from 'webpack';
import { workerData, parentPort } from 'worker_threads';

const { configPath, mode } = workerData as { configPath: string; mode: 'development' | 'production' };

process.env.NODE_ENV = mode || 'production';

const config = require(configPath);
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
