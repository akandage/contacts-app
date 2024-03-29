/**
 * Module dependencies.
 */

const app = require('./app');
const debug = require('debug')('contacts-app:server');
const http = require('http');
const process = require('process');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.SERVER_HTTP_PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.on('error', onError);
server.on('listening', onListening);
server.on('close', onClose);

/**
 * Exit gracefully on SIGINT.
 */

process.on('SIGINT', function(){
  if (server)
  {
    server.close();
  }
});

/**
 * Startup the server and then start listening for connections.
 */

app.startup().then(() => {
  server.listen(port);
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val)
{
  let port = parseInt(val, 10);

  if (isNaN(port))
  {
    // named pipe
    return val;
  }

  if (port >= 0)
  {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error)
{
  if (error.syscall !== 'listen')
  {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code)
  {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening()
{
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

/**
 * Event listener for HTTP server "close" event.
 */
function onClose()
{
  console.log('HTTP server closed.');

  if (app)
  {
    app.shutdown().then(() => {
      process.exit(0);
    });
  }
}