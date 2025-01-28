import { Request, Response } from 'express';
import { Routes } from '../types';
import { getOctopusConfig, OctopusConfig } from '../config';
import Rounting from './Routing';
import StaticSiteGenerator from './StaticSiteGenerator';
import Renderer from './Renderer';

class OctopusServer {
  octopusConfig!: OctopusConfig;
  dev: boolean = process.env.NODE_ENV !== 'production';
  styles: Record<string, string> = {};
  renderer!: Renderer;
  routes!: Routes;
  routing!: Rounting;

  constructor({ dev }: { dev: boolean }) {
    this.dev = dev;
  }

  register = (config: Record<string, any>) => {
    Object.keys(config).forEach((key) => {
      process.env[key] = config[key];
    });
  };

  render = async (req: Request, res: Response, route: string) => {
    let item = this.routes[route];
    if (!item) {
      item = this.routes['/_error'];
      res.statusCode = 404;
    }
    if (item.runtime.endsWith('.html')) {
      const routePath = this.routing.getRoutePath(item.runtime);
      res.sendFile(routePath);
      return;
    }
    const html = await this.renderer.renderToHTML({ req, res, route: item });
    res.send(html);
  };

  initConfig = async () => {
    const config = getOctopusConfig();
    this.octopusConfig = config;
    this.register({ ...config.publicRuntimeConfig, ...config.serverRuntimeConfig });
  };

  initRoutes = async () => {
    this.routing = new Rounting({ dev: this.dev, config: this.octopusConfig });
    this.routes = await this.routing.generateRoutesMap();
  };

  initRenderer = async () => {
    this.renderer = new Renderer({
      config: this.octopusConfig,
      routes: this.routes
    });
  };

  generateStaticPages = async () => {
    const ssg = new StaticSiteGenerator({
      routes: this.routes,
      outdir: this.octopusConfig.outdir as string,
      renderToHTML: this.renderer.renderToHTML
    });
    await ssg.generate();
  };

  prepare = async () => {
    if (this.dev) {
      const { default: cli } = await import('../cli');
      await cli.dev();
    }

    await this.initConfig();
    await this.initRoutes();
    await this.initRenderer();
    
    if (!this.dev) {
      await this.generateStaticPages();
    }
    return Promise.resolve();
  };

  getRequestHandler = async (req: Request, res: Response) => {
    return () => {};
  };
}

export default function createServer({ dev }: { dev: boolean }) {
  const server = new OctopusServer({ dev });
  return {
    getRequestHandler: server.getRequestHandler,
    render: server.render,
    prepare: server.prepare,
    getConfig: getOctopusConfig
  };
}
