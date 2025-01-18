export interface OctopusConfig {
  publicRuntimeConfig?: Record<string, any>;
  serverRuntimeConfig?: Record<string, any>;
  pagesdir?: string;
  outdir?: string;
  clientEntries?: string[];
  serverEntries?: string[];
  assetPrefix?: string;
  webpack?: (
    config: any,
    options: { isServer: boolean; buildId: string }
  ) => OctopusConfig;
}
export function defineConfig(config: OctopusConfig) {
  return config;
}
