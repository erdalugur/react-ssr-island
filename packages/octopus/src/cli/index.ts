import { Worker } from 'worker_threads';
import * as path from 'path';
import watchpack from '../webpack/watchpack';

class CommandLineInterface {
  constructor() {
    this.asyncWorker = this.asyncWorker.bind(this);
    this.build = this.build.bind(this);
    this.dev = this.dev.bind(this);
  }
  asyncWorker(mode: 'development' | 'production') {
    const promises = [{ isServer: false }, { isServer: true }].map((config) => {
      return new Promise((resolve, reject) => {
        const p = path.resolve(__dirname, 'worker');
        const worker = new Worker(p, {
          workerData: {
            isServer: config.isServer,
            mode
          }
        });

        worker.on('message', (files) => {
          watchpack.emitBundleUpdated(config.isServer);
          resolve(files);
        });

        worker.on('error', (err) => {
          reject(err);
        });

        worker.on('exit', (code) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      });
    });

    return Promise.all(promises);
  }
  build() {
    return this.asyncWorker('production');
  }

  dev() {
    return this.asyncWorker('development');
  }
}

const cli = new CommandLineInterface();
export default cli;
