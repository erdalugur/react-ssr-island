#!/usr/bin/env node

const args = process.argv.slice(2);
const baseCommand = args[0];
const command = ['dev', 'build'].includes(baseCommand) ? baseCommand : '';

if (!command) {
  console.log('please use dev or build command')
  process.exit(0);
}
switch (command) {
  case "build":
    require('../webpack').build();
    break;
  case 'dev':
    require('../webpack').watch();
    break;
  default:
    break;
}