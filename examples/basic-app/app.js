const express = require('express');
const compression = require('compression');
const octopus = require('octopus/server');
const isomorphicFetch = require('isomorphic-fetch');
fetch = isomorphicFetch;
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';
const app = express();
app.use(compression());

app.use('/dist', express.static('dist'));

app.get('/favicon.ico', (req, res, next) => {
  res.sendStatus(404);
});

const requestHandler = octopus.createRequestHandler({
  dev: process.env.NODE_ENV !== 'production'
});

app.get('*', (req, res, next) => {
  const normalizedPath = req.originalUrl === '/' ? '/index' : req.originalUrl;
  requestHandler(req, res, normalizedPath);
});

app.listen(PORT, () => {
  console.log(`application listenin on: http://localhost:${PORT}`);
});
