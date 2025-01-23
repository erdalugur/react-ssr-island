export interface OctopusConfig {
  publicRuntimeConfig?: Record<string, any>;
  serverRuntimeConfig?: Record<string, any>;
  pagesdir?: string;
  outdir?: string;
  clientEntries?: Record<string, string>;
  serverEntries?: Record<string, string>;
  assetPrefix?: string;
  webpack?: (config: any, options: { isServer: boolean; buildId: string }) => OctopusConfig;
  inlineCss?: boolean;
}
export function defineConfig(config: OctopusConfig) {
  return config;
}
