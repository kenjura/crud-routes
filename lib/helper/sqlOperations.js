const SqlOperationError = require('../error/SqlOperationError');
const winston           = require('winston');
const _                 = require('lodash');

// module.exports = { create, find, findOne, remove, removeMany, update, upsertMany };
module.exports = { find, findOne };

async function find(args) {
	try {
		const data = await args.model.findAll({
			where: args.filters,
			offset: args.offset,
			limit: args.limit,
			order: args.sort,
		});
		const filterCount = await args.model.count({ where:args.filters });
		const totalCount = await args.model.count();
		console.log({ filterCount, totalCount });
		return { data, filterCount, totalCount }
	} catch (err) {
		fail(err, 'find');
		throw new SqlOperationError(err.message);
	}
}

async function findOne(args) {
	try {
	    const data = await args.model.findById(args.params._id);
	    return { data, status: data && 200 || 404 };
	} catch (err) {
	    fail(err,'findOne');
	    throw new SqlOperationError(err.message);
	}
}

function fail(message, method) {
  if (process.env.NODE_ENV !== 'test')
    winston.error(`generic-api-library > sqlOperations > ${method} > ERROR:`,message);
}