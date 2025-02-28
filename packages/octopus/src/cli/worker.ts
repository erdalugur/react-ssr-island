import webpack, { Stats } from 'webpack';
import { workerData, parentPort } from 'worker_threads';
import createConfig, { ConfigOptions } from '../webpack/config';
const { isServer, mode } = workerData as ConfigOptions;

process.env.NODE_ENV = mode || 'production';

const config = createConfig({ isServer, mode });
const compiler = webpack(config);

if (mode === 'development') {
  compiler.watch({}, webpackCompilerHandler);
} else {
  compiler.run(webpackCompilerHandler);
}

function webpackCompilerHandler(err: Error | null | undefined, stats?: Stats) {
  if (err) {
    parentPort?.postMessage(`build failed with errors: ${err.message}`);
    process.exit(1);
  } else if (stats?.hasErrors()) {
    parentPort?.postMessage(`build failed with errors: ${stats.toString('errors-only')}`);
    process.exit(1);
  } else {
    const info = stats?.toJson({ all: false, builtAt: true, assets: true });
    const names = info?.assets?.map(a => a.name) || []
    parentPort?.postMessage(JSON.stringify(names.filter(Boolean) ));
  }
}
