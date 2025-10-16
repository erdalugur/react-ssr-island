import { OctopusConfig } from '../config';
import { Routes } from '../types';
import { readFile } from '../utils';
import path from 'path';
export default class Routing {
  private outdir: string;
  private routePathsCache: Record<string, string> = {};
  private routes!: Routes;
  constructor({ config }: { config: OctopusConfig }) {
    this.outdir = config.outdir as string;
  }
  private manifestLoader = async <T>(m: string): Promise<T> => {
    const mod = await readFile(path.join(this.outdir, m));
    return JSON.parse(mod);
  };

  getRoutePath = (route: string) => {
    if (this.routePathsCache[route]) {
      return this.routePathsCache[route];
    }
    const routePath = path.join(this.outdir, route);
    this.routePathsCache[route] = routePath;
    return routePath;
  };

  getRoute = (route: string) => {
    return this.routes[route];
  };

  getErrorRoute = () => {
    return this.getRoute('/_error');
  };

  getRoutes = () => {
    return this.routes;
  };

  getDocument = () => {
    const { Page } = this.getRoute('/_document');
    return Page;
  };

  generateRoutesMap = async () => {
    const [node, web] = await Promise.all([
      this.manifestLoader<any>('pages-manifest.json'),
      this.manifestLoader<any>('static-manifest.json')
    ]);

    const routes: Routes = {};
    for (const key in node) {
      const item = { ...node[key], js: web[key]?.js || [] };
      item.route = key;
      const mod = await import(this.getRoutePath(item.runtime));
      item.Page = mod.default;
      item.Meta = mod.Meta || (() => null);
      item.getServerSideProps = mod.getServerSideProps || (() => ({ props: {} }));
      routes[key] = item;
    }
    this.routes = routes;
  };

  refreshRoutes = async (isServer: boolean) => {
    if (isServer) {
      for (const cachedPath in require.cache) {
        if (cachedPath.startsWith(this.outdir)) {
          delete require.cache[cachedPath];
        }
      }
    }

    await this.generateRoutesMap();
    return Promise.resolve();
  };
}
