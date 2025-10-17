require('./scripts/ensureCompiled')();
const JsonLogger = require('./compiled/logger').JsonLogger;
module.exports = JsonLogger;
