import { OctopusConfig } from '../config';
import { Routes } from '../types';
import { promises as fs } from 'fs';
import path from 'path';
export default class Routing {
  private outdir: string;
  private routePathsCache: Record<string, string> = {};
  private routes!: Routes;
  constructor({ config }: { config: OctopusConfig }) {
    this.outdir = config.outdir as string;
  }
  private manifestLoader = async <T = any>(m: string): Promise<T> => {
    const mod = await fs.readFile(path.join(this.outdir, m), 'utf-8');
    return JSON.parse(mod);
  };

  private getManifestsJson = async () => {
    return Promise.all([
      this.manifestLoader('pages-manifest.json'),
      this.manifestLoader('static-manifest.json')
    ]);
  };

  private getRoutePath = (route: string) => {
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
    const [node, web] = await this.getManifestsJson();
    const routes: Routes = {};
    for (const [key, item] of Object.entries<any>(node)) {
      if (!item || !item.runtime) continue;
      item.js = web[key]?.js || [];
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
      Object.keys(require.cache)
        .filter((cachedPath) => cachedPath.startsWith(this.outdir))
        .forEach((cachedPath) => delete require.cache[cachedPath]);
    }

    await this.generateRoutesMap();
  };

  matchRoute = (route: string) => {
    const cleanPath = route.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

    if (this.routes[cleanPath]) {
      return cleanPath;
    }

    for (const routeKey of Object.keys(this.routes)) {
      const normalizedRoute = routeKey.replace(/\/+$/, '') || '/';
      const pattern = '^' + normalizedRoute.replace(/\[.+?\]/g, '[^/]+') + '$';
      const regex = new RegExp(pattern);

      if (regex.test(cleanPath)) {
        return routeKey;
      }
    }

    return undefined;
  };

  getRouteParams = (pattern: string, route: string) => {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = route.split('/').filter(Boolean);

    const params: Record<string, string> = {};

    patternParts.forEach((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const key = part.slice(1, -1);
        params[key] = pathParts[i];
      }
    });

    return params;
  };
}
