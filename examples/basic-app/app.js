const http = require('http');
const { createServer } = require('octopus');
const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';

const server = createServer({ dev: dev });
const requestHandler = server.getRequestHandler();

server.prepare().then(() => {
  http
    .createServer(requestHandler)
    .listen(PORT, () => {
      console.log(`application listenin on: http://localhost:${PORT}`);
    });
});
