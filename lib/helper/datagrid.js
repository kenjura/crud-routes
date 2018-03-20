const _          = require('lodash');
const inflection = require('inflection');

module.exports = renderDatagrid;

function renderDatagrid({ data=[], fields=[] } = {}) {
  if (!fields.length) fields = getDefaultFields(data);
  // TODO: if fields were provided by user, go through and make sure they have render functions
  const head = renderHead(fields);
  const rows = data.map(d => renderRow(d, fields)).join('');
  return `<table>
    <thead>${head}</thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function getDefaultFields(data=[]) {
  return _.map(data[0] || {}, (value, key) => ({
    name: key,
    type: getType(value),
    label: inflection.titleize(key),
    render: getRenderer(getType(value)),
  }));
}

function getRenderer(type) {
  // future plans: currency, date/time rendering, etc
  switch (type) {
    case 'date': return value => value.toLocaleString();
    case 'object': return value => JSON.stringify(value);
    case 'string':
    case 'number':
    case 'boolean':
    default:
      return value => value;
  }
}

function getType(value) {
  // future plans: figure out the difference between an array and an object, return complex structure for array-of-objects, etc
  // for now...
  return typeof value;
}

function renderHead(fields) {
  return fields.map(f => `<th>${f.label}</th>`).join('');
}

function renderRow(row, fields) {
  const cells = fields.map(f => `<td>${f.render(row[f.name], row)}</td>`);
  return `<tr>${cells.join('')}</tr>`;
}