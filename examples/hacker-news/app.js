const express = require('express');
const compression = require('compression');
const { createServer } = require('octopus');
const { parse } = require('url');

const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';

const octopus = createServer({ dev: dev });

octopus.prepare().then(() => {
  const app = express();
  app.use(compression());

  app.use('/dist', express.static('dist'));

  app.get('/favicon.ico', (req, res, next) => {
    res.sendStatus(404);
  });

  app.get('/news/:page', (req, res, next) => {
    octopus.render(req, res, '/index');
  });

  app.get('*', (req, res, next) => {
    const { pathname } = parse(req.originalUrl, true);
    const route = pathname === '/' ? '/index' : pathname;
    octopus.render(req, res, route);
  });

  app.listen(PORT, () => {
    console.log(`application listenin on: http://localhost:${PORT}`);
  });
});
