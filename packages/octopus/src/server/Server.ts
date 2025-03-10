import { Request, Response } from 'express';
import Rounting from './Routing';
import Renderer from './Renderer';

export default class OctopusServer {
  renderer!: Renderer;
  routing!: Rounting;

  constructor({ routing, renderer }: { routing: Rounting; renderer: Renderer }) {
    this.routing = routing;
    this.renderer = renderer;
  }

  render = async (req: Request, res: Response, route: string) => {
    let item = this.routing.getRoute(route);
    if (!item) {
      item = this.routing.getRoute('/_error');
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
}
