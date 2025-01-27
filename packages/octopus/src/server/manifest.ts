import { OctopusConfig } from '../config';
import { AppManifest } from '../types';
import { readFile } from '../utils';
import path from 'path';

export default class Manifest {
  octopusConfig: OctopusConfig;
  dev: boolean;
  outdir: string;

  constructor({ config, dev }: { config: OctopusConfig; dev: boolean }) {
    this.octopusConfig = config;
    this.dev = dev;
    this.outdir = config.outdir as string;
  }

  loader = async <T>(m: string): Promise<T> => {
    const mod = await readFile(path.join(this.outdir, m));
    return Promise.resolve(JSON.parse(mod));
  };

  ssgLoader = async (): Promise<{ [route: string]: { destination: string; params: any } }> => {
    if (!this.octopusConfig.ssg) return Promise.resolve({});

    const ssg = await this.octopusConfig.ssg();
    return ssg.reduce((acc: any, route) => {
      acc[route.source] = {
        destination: route.destination,
        params: route.params
      };
      return acc;
    }, {});
  };

  generate = async () => {
    const pagesManifest = await this.loader<any>('pages-manifest.json');
    const clientManifest = await this.loader<any>('static-manifest.json');

    const ssgPages = await this.ssgLoader();

    const manifest: AppManifest = {};
    for (const key in pagesManifest) {
      const item = { ...pagesManifest[key], js: clientManifest[key]?.js || [] };
      const ssg = ssgPages[key];
      if (ssg) {
        manifest[ssg.destination] = {
          ...item,
          ...ssg,
          ssg: true
        };
      } else {
        manifest[key] = item;
      }
    }
    return manifest;
  };
}
