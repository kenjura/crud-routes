const getArgs = require('./argHelper');
// const ops     = require('./mongooseOperations');
const ops = require('./sqlOperations');
const winston = require('winston');

const globalOptions = {};

module.exports = CRUDRoutes;
module.exports.options = globalOptions;

function CRUDRoutes(router, path, model, _options) {
  // expects:
  //  - router:  an instance of express router to bind routes to
  //  - path:    path to bind routes to
  //  - model:   a Mongoose model, connected and ready to use
  //  - options: optional object with options
  // returns mongoose routes

  const options = Object.assign({}, globalOptions, _options);

  const CRUD = require('express').Router();
  CRUD.get('/',
    addArgs(model, options),
    options.beforeFind       || noop,
    options.find             || find,
    options.afterFind        || noop,
    options.render           || render);
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
  CRUD.all('*', (err, req, res, next) => {
    winston.error(err);
    res.send('there was a bear');
  });

  if (options.legacy) return CRUD;
  router.use(path, CRUD);
  return;
}

CRUDRoutes.legacy = function(model, options={}) {
  return CRUDRoutes(null, null, model, Object.assign(options, { legacy:true }));
};

function addArgs(model, options) {
  return function(req, res, next) {
    req.args = Object.assign(
      {},
      getArgs(req.query, options),
      { body:req.body, model, options, params:req.params },
    );
    next();
  };
}

async function find(req, res, next) {
  const result = await ops.find(req.args);
  if (result.filterCount) res.set('X-Filter-Count', result.filterCount);
  if (result.totalCount) res.set('X-Total-Count', result.totalCount);
  res.result = result;
  await next();
  // res
  //   .status(result.status || 200)
  //   .send(result.data);
}
async function findOne(req, res, next) {
  const result = await ops.findOne(req.args);
  res
    .status(result.status || 200)
    .send(result.data);
}
async function create(req, res, next) {
  const result = await ops.create(req.args);
  res
    .status(result.status || 201)
    .send(result.data);
}
async function update(req, res, next) {
  const result = await ops.update(req.args);
  res
    .status(result.status || 200)
    .send(result.data);
}
async function upsertMany(req, res, next) {
  const result = await ops.upsertMany(req.args);
  res
    .status(result.status || 201)
    .send(result.data);
}
async function remove(req, res, next) {
  const result = await ops.remove(req.args);
  res
    .status(result.status || 200)
    .send(result.data);
}
async function removeMany(req, res, next) {
  const result = await ops.removeMany(req.args);
  res
    .status(result.status || 200)
    .send(result.data);
}
async function render(req, res, next) {
  res
    .status(res.result.status || 200)
    .send(res.result.data);
}


async function noop(req, res, next) { await next(); }
