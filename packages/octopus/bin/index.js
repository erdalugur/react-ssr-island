#!/usr/bin/env node

const args = process.argv.slice(2);
const cli = require('../compiled/cli').default;

const baseCommand = args[0];

const commandMap = {
  dev: cli.dev,
  build: cli.build
};
const command = commandMap[baseCommand];

if (!command) {
  console.log(
    `invalid command, currently available commands are ${Object.keys(commandMap).join(', ')}`
  );
  process.exit(1);
}

command();
