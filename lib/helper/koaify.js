// with much respect to https://github.com/vkurchatkin/koa-connect

module.exports = koaify;

function koaify(connectMiddleware) {
  return function koaConnect(ctx, next) {
    return new Promise((resolve, reject) => {
      enhanceContext(ctx);
      connectMiddleware(ctx.req, ctx.res, err => {
        if (err) reject(err);
        else resolve(next());
      });
    });
  };
}

function enhanceContext(ctx) {
  ctx.req.koa = true;
  ctx.req.params = ctx.params;
  ctx.req.query = ctx.request.query;
  ctx.req.body = ctx.request.body;
  ctx.res.send = (msg, status=200, contentType='text/html', headers={}) => {
    if (!ctx.res.headersSent) ctx.res.writeHead(status, Object.assign({ 'Content-Type': contentType }, headers));
    ctx.res.end(msg instanceof String ? msg : JSON.stringify(msg));
  };
  ctx.res.redirect = (url) => {
    ctx.res.writeHead(302, { Location:url });
    ctx.res.end();
  };
}