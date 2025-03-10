require('./scripts/ensureCompiled')();

module.exports = {
  createServer: require('./compiled/server').default,
  defineConfig: require('./compiled/config').defineConfig
};
