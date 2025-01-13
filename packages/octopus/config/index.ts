export default () => {
  if (typeof window !== 'undefined') {
    return (window as any).__INITIAL_STATE__.runtimeConfig
  }
  return (globalThis as any).runtimeConfig
}

export function setConfig(config: any) {
  (globalThis as any).runtimeConfig = config;
}

export interface OctopusConfig {
  publicRuntimeConfig?: Record<string, any>
  serverRuntimeConfig?: Record<string, any>
  pagesdir?: string
  outdir?: string
}
export function defineConfig(config: OctopusConfig) {
  return config;
}