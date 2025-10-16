import { Request, Response } from 'express';
import { getOctopusConfig, register } from '../config';
import Renderer from './Renderer';
import Routing from './Routing';
import { JsonLogger } from '../logger';

export default function createServer({ dev, logger }: { dev: boolean; logger?: JsonLogger }) {
  const config = getOctopusConfig();
  const routing = new Routing({ config });
  const renderer = new Renderer({
    config: config,
    routing: routing,
    logger: logger
  });

  return {
    render: renderer.render,
    prepare: async () => {
      register(config);
      if (dev) {
        const { default: OctopusHMR } = await import('./OctopusHMR');
        const hmr = new OctopusHMR({ routing, config, logger });
        await hmr.start();
      }
      await routing.generateRoutesMap();
      return Promise.resolve();
    }
  };
}
