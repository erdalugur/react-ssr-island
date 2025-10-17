const express = require('express');
const compression = require('compression');
const { createServer } = require('octopus');
const { parse } = require('url');

const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';

const server = createServer({ dev: dev });

server.prepare().then(({ renderer }) => {
  const app = express();
  app.use(compression());

  app.use('/dist', express.static('dist'));

  app.get('*', (req, res, next) => {
    const { pathname } = parse(req.originalUrl, true);
    const route = pathname === '/' ? '/index' : pathname;
    renderer.render(req, res, route);
  });

  app.listen(PORT, () => {
    console.log(`application listenin on: http://localhost:${PORT}`);
  });
});
