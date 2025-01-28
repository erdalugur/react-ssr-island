import { Route, Routes, RenderPage } from '../types';
import path from 'path';
import { ensureDirectoryExists, writeFile } from '../utils';

export default class StaticSiteGenerator {
  private outdir: string;
  private routes: Routes;
  private renderToHTML: (args: RenderPage) => Promise<string>;

  constructor({
    outdir,
    routes,
    renderToHTML
  }: {
    outdir: string;
    routes: Routes;
    renderToHTML: (args: RenderPage) => Promise<string>;
  }) {
    this.outdir = outdir;
    this.routes = routes;
    this.renderToHTML = renderToHTML;
  }

  generate = async () => {
    const pages = Object.values(this.routes).filter((item) => item.ssg);
    for (const page of pages) {
      await this.savePageAsHTML(page);
    }
  };

  savePageAsHTML = async (item: Route) => {
    const target = path.join(this.outdir, 'out', item.destination);
    const html = await this.renderToHTML({ req: {} as any, res: {} as any, route: item });
    item.runtime = `/out${item.route}.html`;
    const htmlPath = path.join(this.outdir, item.runtime);
    await ensureDirectoryExists(target);
    await writeFile(htmlPath, html);
  };
}
