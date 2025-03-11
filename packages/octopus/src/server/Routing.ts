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

  getStaticRoutes = () => {
    return Object.values(this.routes).filter((item) => item.ssg);
  };

  getRoutes = () => {
    return this.routes;
  };

  getDocument = () => {
    const { Page } = this.getRoute('/_document');
    return Page;
  };

  generateRoutesMap = async () => {
    const pagesManifest = await this.manifestLoader<any>('pages-manifest.json');
    const clientManifest = await this.manifestLoader<any>('static-manifest.json');
    const promises = Object.keys(pagesManifest)
      .filter((key) => pagesManifest[key].runtime)
      .map(async (key) => {
        const item = { ...pagesManifest[key], js: clientManifest[key]?.js || [] };
        item.route = key;
        const mod = await import(this.getRoutePath(item.runtime));
        item.Page = mod.default;
        item.Meta = mod.Meta || (() => null);
        if (mod.getStaticProps) {
          item.ssg = true;
          if (mod.getStaticPaths) {
            const props = await mod.getStaticPaths();
            return (props.paths || []).map((p: any) => {
              const prefix = p.route || key;
              const route = [prefix, p.params?.slug].filter(Boolean).join('/');
              return {
                [route]: {
                  ...item,
                  destination: prefix,
                  params: p.params,
                  route: route,
                  loader: mod.getStaticProps
                }
              };
            });
          } else {
            return {
              [key]: {
                ...item,
                destination: '',
                params: {},
                route: key,
                loader: mod.getStaticProps
              }
            };
          }
        } else {
          return {
            [key]: {
              ...item,
              loader: mod.getServerSideProps || (() => ({ props: {} }))
            }
          };
        }
      });
    const results = await Promise.all(promises);
    this.routes = results.flat().reduce((acc, result) => {
      return { ...acc, ...result };
    }, {}) as Routes;
  };
  refreshRoutes = async (isServer: boolean, files: string[]) => {
    if (isServer) {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const modulePath = path.join(this.outdir, file);
        delete require.cache[modulePath];
      }
    }
    await this.generateRoutesMap();
    return Promise.resolve();
  };
}
