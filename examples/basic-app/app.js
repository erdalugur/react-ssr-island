const express = require('express');
const compression = require('compression');
const { createServer } = require('octopus');

const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';

const server = createServer({ dev: dev });

server.prepare().then(() => {
  const app = express();
  app.use(compression());

  app.use('/dist', express.static('dist'));

  app.get('*', (req, res) => {
    server.getRequestHandler()(req, res);
  });

  app.listen(PORT, () => {
    console.log(`application listenin on: http://localhost:${PORT}`);
  });
});
