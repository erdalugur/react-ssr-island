const path = require('path');

const root = process.cwd();
const distdir = path.join(root, 'dist');
const pagesdir = path.join(root, 'pages');

function mergeConfig(config) {
  config.outdir = config.outdir || distdir;
  config.pagesdir = config.pagesdir || pagesdir;
  config.serverRuntimeConfig = config.serverRuntimeConfig || {};
  config.publicRuntimeConfig = config.publicRuntimeConfig || {};
  return config;
}

function getOctopusConfig() {
  try {
    const cofig = require(path.join(process.cwd(), 'octopus.config.js'));
    return mergeConfig(cofig);
  } catch (error) {
    return mergeConfig({});
  }
}

module.exports = {
  getOctopusConfig
}