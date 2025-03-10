const { existsSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const octopusDir = path.resolve(__dirname, '..');
const compiledPath = path.join(octopusDir, 'compiled');
const compiledCliPath = path.join(compiledPath, 'cli/index.js');

const ensureCompiled = () => {
  if (!existsSync(compiledCliPath)) {
    console.log('Compiled folder not found. Running build script in octopus folder...');
    const result = spawnSync('yarn', ['build'], {
      stdio: 'inherit',
      shell: true,
      cwd: octopusDir
    });

    if (result.error) {
      console.error('Error running build script:', result.error);
      process.exit(1);
    }

    if (result.status !== 0) {
      console.error(`Build script failed with exit code ${result.status}. Exiting...`);
      process.exit(result.status);
    }

    if (!existsSync(compiledCliPath)) {
      console.error('Build completed, but compiled/index.js was not found. Exiting...');
      process.exit(1);
    }
  }
};

module.exports = ensureCompiled;
