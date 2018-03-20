const MongooseOperationError = require('../error/MongooseOperationError');
const winston                = require('winston');
const _                      = require('lodash');

module.exports = { create, find, findOne, remove, removeMany, update, upsertMany };

async function find(args) {
  try {
    // const args = getArgs(ctx.query);
    const query = args.model.find(args.filters, args.select);
    if (args.options.populate) query.populate(args.options.populate);
    const data = await query
      .skip(args.offset)
      .limit(args.limit)
      .sort(args.sort)
      .exec();
    const filterCount = await args.model.count(args.filters).exec();
    const totalCount = await args.model.count().exec();
    return { data, filterCount, totalCount };
  } catch (err) {
    fail(err, 'find');
    throw new MongooseOperationError(err.message);
  }
}
async function findOne(args) {
  try {
    const data = await args.model.findOne({ _id:args.params._id });
    return { data, status: data && 200 || 404 };
  } catch (err) {
    fail(err,'findOne');
    throw new MongooseOperationError(err.message);
  }
}
async function create(args) {
  try {
    const data = await args.model.create(args.body);
    return { data, status:201 };
  } catch (err) {
    fail(err,'create');
    throw new MongooseOperationError(err.message);
  }
}
async function update(args) {
  try {
    const data = await args.model.findOneAndUpdate(args.params, args.body, { new: true });
    return { data, status: data ? 200 : 404 };
  } catch (err) {
    fail(err, 'update');
    throw new MongooseOperationError(err.message);
  }
}
async function upsertMany(args) {
  try {
    const inserts = args.body.filter(e => !e._id);
    const updates = args.body.filter(e => e._id);
    const inserted = await args.model.insertMany(inserts, { rawResult:false });
    const updated = [];
    for (var i = 0; i < updates.length; i++) {
      let u = updates[i];
      if (!u || !u._id) continue;
      const { _id } = u;
      delete u._id;
      const update = await args.model.findOneAndUpdate({ _id }, u, { new:true });
      if (update) updated.push(update);
    }
    return { data: { inserted, updated }, status: 201 };
  } catch(err) {
    fail(err, 'upsertMany');
    throw new MongooseOperationError(err.message);
  }
}
async function remove(args) {
  try {
    const data = await args.model.findOneAndRemove(args.params, { rawResult:false });
    return { data, status: data ? 200 : 400 };
  } catch (err) {
    fail(err, 'remove');
    throw new MongooseOperationError(err.message);
  }
}
async function removeMany(args) {
  try {
    if (_.isEmpty(args.filters)) throw new Error('Filters are required to use this endpoint.');
    const data = await args.model.find(args.filters).exec();
    const result = await args.model.remove(args.filters);
    const numAffected = result.n;
    const status = (numAffected >= 1) && 204 || (numAffected === 0) && 404 || 500;
    return { data, numAffected, status };
  } catch(err) {
    fail(err, 'removeMany');
    throw new MongooseOperationError(err.message);
  }
}

function fail(message, method) {
  if (process.env.NODE_ENV !== 'test')
    winston.error(`generic-api-library > mongooseOperations > ${method} > ERROR:`,message);
}