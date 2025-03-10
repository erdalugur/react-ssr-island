import { Route } from '../types';
import path from 'path';
import { ensureDirectoryExists, writeFile } from '../utils';
import Routing from './Routing';
import Renderer from './Renderer';
import { OctopusConfig } from '../config';

export default class StaticSiteGenerator {
  private config: OctopusConfig;
  private routing!: Routing;
  private renderer!: Renderer;

  constructor({
    config,
    routing,
    renderer
  }: {
    config: OctopusConfig;
    routing: Routing;
    renderer: Renderer;
  }) {
    this.config = config;
    this.routing = routing;
    this.renderer = renderer;
  }

  generate = async () => {
    const pages = this.routing.getStaticRoutes();
    for (const page of pages) {
      await this.savePageAsHTML(page);
    }
  };

  savePageAsHTML = async (item: Route) => {
    const outdir = this.config.outdir as string;
    const target = path.join(outdir, 'out', item.destination);
    const html = await this.renderer.renderToHTML({ req: {} as any, res: {} as any, route: item });
    item.runtime = `/out${item.route}.html`;
    const htmlPath = path.join(outdir, item.runtime);
    await ensureDirectoryExists(target);
    await writeFile(htmlPath, html);
  };
}
