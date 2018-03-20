const getArgs = require('./argHelper');
const ops     = require('./mongooseOperations');
const Router  = require('koa-router');
const winston = require('winston');

module.exports = CRUDRoutes;


function CRUDRoutes(router, path, model, options={}) {
  // expects:
  //  - router:  an instance of koa-router to bind routes to
  //  - path:    path to bind routes to
  //  - model:   a Mongoose model, connected and ready to use
  //  - options: optional object with options
  // returns koa-router routes

  const CRUD = new Router();
  CRUD.all('*', async (ctx, next) => {
    try {
      await next();
    } catch(err) {
      ctx.status = err.statusCode || err.status || 500;
      ctx.body = {
        message: err.message
      };
      winston.error(err);
    }
  });
  CRUD.get('/',
    addArgs(model, options),
    options.beforeFind       || noop,
    options.find             || find,
    options.afterFind        || noop);
  CRUD.get('/:_id',
    addArgs(model, options),
    options.beforeFindOne    || noop,
    options.findOne          || findOne,
    options.afterFindOne     || noop);
  CRUD.post('/',
    addArgs(model, options),
    options.beforeCreate     || noop,
    options.create           || create,
    options.afterCreate      || noop);
  CRUD.put('/:_id',
    addArgs(model, options),
    options.beforeUpdate     || noop,
    options.update           || update,
    options.afterUpdate      || noop);
  CRUD.put('/',
    addArgs(model, options),
    options.beforeUpsertMany || noop,
    options.upsertMany       || upsertMany,
    options.afterUpsertMany  || noop);
  CRUD.delete('/:_id',
    addArgs(model, options),
    options.beforeRemove     || noop,
    options.remove           || remove,
    options.afterRemove      || noop);
  CRUD.delete('/',
    addArgs(model, options),
    options.beforeRemoveMany || noop,
    options.removeMany       || removeMany,
    options.afterRemoveMany  || noop);
  router.use(path, CRUD.routes(), CRUD.allowedMethods());
  return;
}


function addArgs(model, options) {
  return async function(ctx, next) {
    ctx.args = Object.assign(
      {},
      getArgs(ctx.request.query),
      { body:ctx.request.body, model, options, params:ctx.params },
    );
    await next();
  };
}

async function find(ctx, next) {
  const result = await ops.find(ctx.args);
  if (result.filterCount) ctx.set('X-Filter-Count', result.filterCount);
  if (result.totalCount) ctx.set('X-Total-Count', result.totalCount);
  ctx.status = result.status || 200;
  ctx.body = result.data;
}
async function findOne(ctx, next) {
  const result = await ops.findOne(ctx.args);
  ctx.status = result.status || 200;
  ctx.body = result.data;
}
async function create(ctx, next) {
  const result = await ops.create(ctx.args);
  ctx.status = result.status || 201;
  ctx.body = result.data;
}
async function update(ctx, next) {
  const result = await ops.update(ctx.args);
  ctx.status = result.status || 200;
  ctx.body = result.data;
}
async function upsertMany(ctx, next) {
  const result = await ops.upsertMany(ctx.args);
  ctx.status = result.status || 201;
  ctx.body = result.data;
}
async function remove(ctx, next) {
  const result = await ops.remove(ctx.args);
  ctx.status = result.status || 200;
  ctx.body = result.data;
}
async function removeMany(ctx, next) {
  const result = await ops.removeMany(ctx.args);
  ctx.status = result.status || 200;
  ctx.body = result.data;
}

async function noop(ctx, next) { await next(); }