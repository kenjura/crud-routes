const _       = require('lodash');

const { Op } = require('sequelize');

module.exports = getArgs;

function getArgs(args, options={}) {
  // reserved args: sort, limit, offset, fields
  const RESERVED_ARGS = [ 'sort', 'limit', 'offset', 'fields', 'q' ];

  // sort
  const sort = parseSort(args.sort, options.dialect);
  if (args.q) sort.score = { $meta:'textScore' };

  // limit
  const limit = parseInt(args.limit) || 50;

  // offset
  const offset = parseInt(args.offset) || 0;

  // fields
  // const select = args.fields ? args.fields.replace(/,/g,' ') : '';
  const fields = (args.fields||'').split(',').filter(f=>f);
  const select = _.zipObject(fields, fields.map(()=>1));
  if (args.q) select.score = { $meta:'textScore' };

  // filters
  const filterArgs = _.omit( args, RESERVED_ARGS );
  const parser = options.dialect === 'sql' ? parseFiltersSequelize : parseFiltersMongoose;
  const filters = _.mapValues(filterArgs,parser);
  if (args.q) {
    filters.$or = [
      { $text: { $search: args.q }},
      { name: { $regex:new RegExp(args.q, 'gi') }}
    ];
  }

  return {  filters, limit, offset, select, sort };
}
function parseSort(value, dialect='mongoose') {
  if (dialect==='sql') return value ? value.split(',').map(v => v.substr(0,1)==='-' ? [ v.substr(1), 'DESC' ] : [v] ) : [];
  else return value ? value.replace(/,/g, ' ') : { _id:1 };
}
function parseFiltersMongoose(value) {
  // range
  if (value.indexOf('-')>-1) return { $gte:value.split('-')[0], $lte:value.split('-')[1] };

  // in
  if (value.indexOf(',')>-1) return { $in:value.split(',') };

  // regex
  if (value.substr(0,1)=='/' && value.substr(-1,1)=='/') return new RegExp(value.substr(1, value.length-2));

  // literal
  return value;
}
function parseFiltersSequelize(value) {
  // range
  if (value.indexOf('-')>-1) return { [Op.between]: value.split('-') };

  // in
  if (value.indexOf(',')>-1) return value.split(',');

  // regex
  // if (value.substr(0,1)=='/' && value.substr(-1,1)=='/') return new RegExp(value.substr(1, value.length-2));

  // like
  if (value.indexOf('%')>-1) return { [Op.like]:value };

  // literal
  return value;
}