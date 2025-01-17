const { Worker } = require('worker_threads');
const path = require('path');

const configPaths = ['./configs/client.config.cjs', './configs/server.config.cjs'];

/**
 *
 * @param {'watch' | 'build'} mode
 * @returns {Promise<any[]>}
 */
function webpackWorker(mode) {
  const promises = configPaths.map((configPath) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.resolve(__dirname, 'worker.js'), {
        workerData: { configPath, mode }
      });

      worker.on('message', (v) => {
        console.log(v);
        resolve();
      });

      worker.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Worker failed with code ${code}`));
        }
      });
    });
  });

  return Promise.all(promises);
}

module.exports = {
  build: function () {
    return webpackWorker('production');
  },
  watch: function () {
    return webpackWorker('development');
  }
};
