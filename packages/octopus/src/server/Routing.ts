import { OctopusConfig } from '../config';
import { Routes } from '../types';
import { promises as fs } from 'fs';
import path from 'path';

function noop(param: any) {
  return () => param;
}
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
      item.Meta = mod.Meta || noop(null);
      item.getServerSideProps = mod.getServerSideProps || mod.getStaticProps || noop({ props: {} });
      item.getStaticParams = mod.getStaticParams;
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

  matchRoute = (route: string): string | undefined => {
    const cleanPath = route.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

    for (const routeKey of Object.keys(this.routes)) {
      const normalizedRoute = routeKey.replace(/\/+$/, '') || '/';
      const pattern = normalizedRoute
        .replace(/\[\.\.\.(.+?)\]/g, '(.+)')
        .replace(/\[(.+?)\]/g, '([^/]+)');

      const regex = new RegExp(`^${pattern}$`);

      if (regex.test(cleanPath)) {
        return routeKey;
      }
    }

    return undefined;
  };

  getRouteURLParams = (pattern: string = '', route: string = '') => {
    const cleanPattern = pattern.replace(/\/+$/, '') || '/';
    const cleanRoute = route.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

    const patternParts = cleanPattern.split('/').filter(Boolean);
    const pathParts = cleanRoute.split('/').filter(Boolean);

    const params: Record<string, string | string[]> = {};

    for (let i = 0; i < patternParts.length; i++) {
      const p = patternParts[i];
      if (p.startsWith('[...') && p.endsWith(']')) {
        const key = p.slice(4, -1);
        params[key] = pathParts.slice(i);
        break;
      }

      if (p.startsWith('[') && p.endsWith(']')) {
        const key = p.slice(1, -1);
        params[key] = pathParts[i];
      }
    }

    return params;
  };

  getStaticRouteParams = (
    staticParams: any[],
    requestParams: Record<string, string>
  ): Record<string, string> | undefined => {
    return Object.keys(requestParams).length
      ? staticParams.find((p) =>
          Object.entries(p).every(([key, value]) => requestParams[key] === value)
        )
      : undefined;
  };
}
