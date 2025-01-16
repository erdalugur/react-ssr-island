const { defineConfig } = require('octopus/config');
const path = require('path');
module.exports = defineConfig({
  publicRuntimeConfig: {
    IMAGE_URL: 'https://www.w3schools.com'
  }
});
