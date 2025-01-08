export default function getConfig() {
  if (typeof window !== "undefined") {
    return {
      publicRuntimeConfig: (window as any).__INITIAL_STATE__
        .publicRuntimeConfig,
    };
  }
  return {
    publicRuntimeConfig: {},
  };
}
