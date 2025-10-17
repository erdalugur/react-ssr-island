import { getOctopusConfig, register } from '../config';
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
    prepare: async () => {
      register(config);
      if (dev) {
        const { default: OctopusHMR } = await import('./OctopusHMR');
        const hmr = new OctopusHMR({ routing, config });
        await hmr.start();
      }
      await routing.generateRoutesMap();
      return Promise.resolve({
        renderer,
        routing
      });
    }
  };
}
