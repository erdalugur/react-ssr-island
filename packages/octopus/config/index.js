module.exports = () => {
  if (typeof window !== 'undefined') {
    return window.__PRELOADED_STATE__.publicRuntimeConfig
  }

  const path = require('path');
  const config = require(path.join(process.cwd(), 'octopus.config.js'));

  return {
    publicRuntimeConfig: config.publicRuntimeConfig,
    serverRuntimeConfig: config.serverRuntimeConfig
  }
}