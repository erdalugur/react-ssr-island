const { defineConfig } = require('octopus/config');
const path = require('path');
module.exports = defineConfig({
  publicRuntimeConfig: {
    API_URL: 'https://hacker-news.firebaseio.com'
  }
});
