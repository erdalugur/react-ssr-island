import { Worker } from 'worker_threads';
import * as path from 'path';

const configPaths = ['./client.config.js', './server.config.js'];

function webpackWorker(mode: 'development' | 'production') {
  const promises = configPaths.map((configPath) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.resolve(__dirname, 'worker.js'), {
        workerData: { configPath, mode }
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