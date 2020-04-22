const _       = require('lodash');

module.exports = getArgs;

function getArgs(args, options) {
  // reserved args: sort, limit, offset, fields
  const RESERVED_ARGS = [ 'sort', 'limit', 'offset', 'fields', 'q' ];

  // sort
  const sort = args.sort ? args.sort.replace(/,/g,' ') : { _id:1 };
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
  const filters = _.mapValues(filterArgs,parseFilters);
  if (args.q) {
    filters.$or = [
      { $text: { $search: args.q }},
      { name: { $regex:new RegExp(args.q, 'gi') }}
    ];
  }

  return {  filters, limit, offset, select, sort, options };
}
function parseFilters(value) {
  if (typeof value !== 'string') return; // this is only here because of hacks in map-application. Value should be a string.

  // range
  if (value.indexOf('-')>-1) return { $gte:value.split('-')[0], $lte:value.split('-')[1] };

  // in
  if (value.indexOf(',')>-1) return { $in:value.split(',') };

  // regex
  if (value.substr(0,1)=='/' && value.substr(-1,1)=='/') return new RegExp(value.substr(1, value.length-2));

  // literal
  return value;
}