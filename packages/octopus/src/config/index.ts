import { Configuration } from 'webpack';
import path from 'path';

export interface OctopusConfig {
  publicRuntimeConfig?: Record<string, any>;
  serverRuntimeConfig?: Record<string, any>;
  pagesdir?: string;
  outdir?: string;
  clientEntries?: Record<string, string>;
  serverEntries?: Record<string, string>;
  assetPrefix?: string;
  webpack?: (config: any, options: { isServer: boolean; buildId: string }) => Configuration;
  inlineCss?: boolean;
}

export function defineConfig(config: OctopusConfig) {
  return config;
}

const root = process.cwd();

function mergeConfig(config: any) {
  config.outdir = (config.outdir || path.join(root, 'dist')) as string;
  config.pagesdir = config.pagesdir || path.join(root, 'pages');
  config.serverRuntimeConfig = config.serverRuntimeConfig || {};
  config.publicRuntimeConfig = config.publicRuntimeConfig || {};
  const names = config.outdir.split('/');
  config.outdirname = names[names.length - 1];
  config.assetPrefix = config.assetPrefix || `/${config.outdirname}`;
  return config;
}

export function getOctopusConfig(): OctopusConfig & { outdirname: string } {
  try {
    const configPath = path.join(root, 'octopus.config.js')
    const config = require(configPath);
    delete require.cache[configPath]
    return mergeConfig(config);
  } catch (error) {
    return mergeConfig({});
  }
}
