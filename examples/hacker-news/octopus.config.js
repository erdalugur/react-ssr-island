const { defineConfig } = require('octopus');

module.exports = defineConfig({
  publicRuntimeConfig: {
    API_URL: 'https://hacker-news.firebaseio.com'
  }
});
