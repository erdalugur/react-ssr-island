import { getOctopusConfig, register } from '../config';
import Renderer from './Renderer';
import Routing from './Routing';
import ServeStatic from './ServeStatic';
import { IncomingMessage, ServerResponse } from 'http';
import { enhanceRenderer } from './utils';

export default function createServer({ dev }: { dev: boolean }) {
  const config = getOctopusConfig();
  const routing = new Routing({ config });
  const renderer = new Renderer({
    config: config,
    routing: routing
  });

  const serveStatic = new ServeStatic({
    publicDir: config.outdir as string
  });
  const enhancedRenderer = enhanceRenderer(renderer, serveStatic, {
    fieldNames: ['requestHandler', 'render', 'renderNotFound', 'renderErrorToHTML']
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
        renderer: {
          render: enhancedRenderer.render,
          renderToHTML: enhancedRenderer.renderToHTML,
          renderErrorToHTML: enhancedRenderer.renderErrorToHTML,
          renderNotFound: enhancedRenderer.renderNotFound
        },
        routing
      });
    },
    getRequestHandler: () => {
      return (req: IncomingMessage, res: ServerResponse) =>
        enhancedRenderer.requestHandler(req as any, res as any);
    }
  };
}
