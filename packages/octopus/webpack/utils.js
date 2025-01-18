const path = require('path');

const root = process.cwd();

function mergeConfig(config) {
  config.outdir = config.outdir || path.join(root, 'dist');
  config.pagesdir = config.pagesdir || path.join(root, 'pages');
  config.serverRuntimeConfig = config.serverRuntimeConfig || {};
  config.publicRuntimeConfig = config.publicRuntimeConfig || {};
  const names = config.outdir.split('/');
  config.outdirname = names[names.length - 1];
  config.assetPrefix = config.assetPrefix || `/${config.outdirname}`;
  return config;
}

function getOctopusConfig() {
  try {
    const cofig = require(path.join(root, 'octopus.config.js'));
    return mergeConfig(cofig);
  } catch (error) {
    return mergeConfig({});
  }
}

module.exports = {
  getOctopusConfig
};
