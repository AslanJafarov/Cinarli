const { createServer } = require('http');
const next = require('next');

const port = process.env.PORT || 3000;
const dev = false;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`Next.js running on port ${port}`);
  });
});
