const httpServer = require('http-server');
const path = require('path');

const root = path.join(__dirname, 'entorno_local');

const server = httpServer.createServer({
  root,
  cache: -1,
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Servidor corriendo en http://localhost:3000');
  console.log('Sirviendo:', root);
});
