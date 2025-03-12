import { Request, Response } from 'express';
import { getOctopusConfig, register } from '../config';
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

  return {
    render: renderer.render,
    prepare: async () => {
      register(config);
      if (dev) {
        const { default: OctopusHMR } = await import('./OctopusHMR');
        const hmr = new OctopusHMR({ routing, config });
        await hmr.start();
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
