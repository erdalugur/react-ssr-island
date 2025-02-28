import createConfig from '../esbuild/config';
import * as esbuild from 'esbuild';

class CommandLineInterface {
  
  constructor() {
    this.asyncWorker = this.asyncWorker.bind(this);
    this.build = this.build.bind(this);
    this.dev = this.dev.bind(this);
  }
  asyncWorker(mode: 'development' | 'production') {
    const promises = [{ isServer: false }, { isServer: true }].map((c) => {
      return new Promise(async (resolve, reject) => {
        try {
          const config = createConfig({
            isServer: c.isServer,
            mode: mode
          });

          const ctx = await esbuild.context(config);
          await ctx.watch();
          resolve(ctx);
        } catch (err) {
          reject(err);
        }
      });
    });
    return Promise.all(promises) as Promise<esbuild.BuildContext<esbuild.BuildOptions>[]>
  }
  build() {
    return this.asyncWorker('production');
  }

  dev = async () => {
    await this.asyncWorker('development');
    return Promise.resolve({});
  }
}

const cli = new CommandLineInterface();
export default cli;
