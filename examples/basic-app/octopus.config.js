const { defineConfig } = require('octopus');
module.exports = defineConfig({
  publicRuntimeConfig: {
    IMAGE_URL: 'https://www.w3schools.com'
  },
  inlineCss: process.env.NODE_ENV === 'production'
});
