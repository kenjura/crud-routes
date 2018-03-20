const server = require('../shared/koa-server');

const router = new require('koa-router')();

router.get('/', (ctx, next) => ctx.body = `
  <h3>generic-api-library</h3>
  <p>This is a koa app for testing generic-api-library.</p>
  <p><a href="/user">user api</a></p>
`);

server.use(router.routes());