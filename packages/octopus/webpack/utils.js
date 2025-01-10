const path = require('path');

function getOctopusConfig() {
  return require(path.join(process.cwd(), 'octopus.config.js'));
}

module.exports = {
  getOctopusConfig
}