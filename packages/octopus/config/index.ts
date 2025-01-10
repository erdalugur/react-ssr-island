export default () => {
  if (typeof window !== 'undefined') {
    return (window as any).__INITIAL_STATE__.runtimeConfig
  }
  return (globalThis as any).runtimeConfig
}

export function setConfig(config: any) {
  (globalThis as any).runtimeConfig = config;
}