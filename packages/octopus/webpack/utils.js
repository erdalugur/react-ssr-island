const path = require('path');

function getOctopusConfig() {
  try {
    return require(path.join(process.cwd(), 'octopus.config.js'));
  } catch (error) {
    return {}
  }
}

module.exports = {
  getOctopusConfig
}