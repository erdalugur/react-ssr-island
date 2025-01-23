import { Worker } from 'worker_threads';
import * as path from 'path';

const configs = [{ isServer: false }, { isServer: true }];

function webpackWorker(mode: 'development' | 'production') {
  const promises = configs.map((config) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.resolve(__dirname, 'worker.js'), {
        workerData: { isServer: config.isServer, mode }
      });

      // Worker olaylarını dinle
      worker.on('message', (v) => {
        console.log(v);
        resolve(v); // resolve içinde data döndürebilirsiniz
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

export function build() {
  return webpackWorker('production');
}

export function watch() {
  return webpackWorker('development');
}
