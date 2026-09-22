// Production entry point for cPanel / Passenger (Setup Node.js App → startup file).
// It serves the output of `npm run build`; there is no custom routing here.
process.env.NODE_ENV = 'production';

const { createServer } = require('http');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;

// `port` lets Next build correct absolute URLs (x-forwarded-port) behind the proxy.
const app = next({ dev: false, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      handle(req, res);
    });
    server.listen(port, () => {
      console.log(`Next.js running on port ${port}`);
    });

    // On restart (tmp/restart.txt, SIGTERM) finish in-flight requests before exiting,
    // so an upload or lead write is not cut off halfway.
    const shutdown = () => {
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 10_000).unref();
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  })
  .catch((error) => {
    console.error('Next.js could not start. Is the site built (`npm run build`)?', error);
    process.exit(1);
  });
