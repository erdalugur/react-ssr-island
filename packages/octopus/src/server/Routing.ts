import { OctopusConfig } from '../config';
import { Routes } from '../types';
import { readFile } from '../utils';
import path from 'path';

export default class Routing {
  private outdir: string;
  private routePathsCache: Record<string, string> = {};

  constructor({ config }: { config: OctopusConfig; dev: boolean }) {
    this.outdir = config.outdir as string;
  }

  private manifestLoder = async <T>(m: string): Promise<T> => {
    const mod = await readFile(path.join(this.outdir, m));
    return Promise.resolve(JSON.parse(mod));
  };

  getRoutePath = (route: string) => {
    if (this.routePathsCache[route]) {
      return this.routePathsCache[route];
    }
    const routePath = path.join(this.outdir, route);
    this.routePathsCache[route] = routePath;
    return routePath;
  };

  generateRoutesMap = async () => {
    const pagesManifest = await this.manifestLoder<any>('pages-manifest.json');
    const clientManifest = await this.manifestLoder<any>('static-manifest.json');

    const promises = Object.keys(pagesManifest).map(async (key) => {
      const item = { ...pagesManifest[key], js: clientManifest[key]?.js || [] };
    
      item.route = key;
      const mod = await import(this.getRoutePath(item.runtime));
      item.Page = mod.default;
      item.Meta = mod.Meta || (() => null);
    
      if (mod.getStaticProps) {
        item.ssg = true;
        if (mod.getStaticPaths) {
          const props = await mod.getStaticPaths();
    
          return (props.paths || []).map((p: any) => {
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
    return results.flat().reduce((acc, result) => {
      return { ...acc, ...result };
    }, {}) as Routes;
  };
}
