import { Request, Response } from 'express';
import { getOctopusConfig } from '../config';
import StaticSiteGenerator from './StaticSiteGenerator';
import Renderer from './Renderer';
import Routing from './Routing';

export default function createServer({ dev }: { dev: boolean }) {
  const config = getOctopusConfig();
  const routing = new Routing({ config });
  const renderer = new Renderer({
    config: config,
    routing: routing
  });

  const register = (config: Record<string, any>) => {
    Object.keys(config).forEach((key) => {
      process.env[key] = config[key];
    });
  };

  return {
    render: renderer.render,
    prepare: async () => {
      register({
        ...config.publicRuntimeConfig,
        ...config.serverRuntimeConfig
      });
      if (dev) {
        const { default: cli } = await import('../cli');
        await cli.dev();
        const { default: watchpack } = await import('../webpack/watchpack');
        watchpack.onBundleUpdated((isServer, files) => {
          // eslint-disable-next-line no-console
          console.log(`🔄 Refreshing ${isServer ? 'server' : 'client'} side bundle...`);
          // eslint-disable-next-line no-console
          console.time('⏳ Refresh time');
          routing.refreshRoutes(isServer, files).finally(() => {
            // eslint-disable-next-line no-console
            console.timeEnd('⏳ Refresh time');
            // eslint-disable-next-line no-console
            console.log(`✅ ${isServer ? 'Server' : 'Client'} side bundle updated successfully!`);
          });
        });
      }
      await routing.generateRoutesMap();
      if (!dev) {
        const ssg = new StaticSiteGenerator({
          config: config,
          renderer: renderer,
          routing: routing
        });
        ssg.generate();
      }
      return Promise.resolve();
    }
  };
}
