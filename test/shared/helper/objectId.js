const ObjectID = require('mongodb').ObjectID;

module.exports = getId;

function getId(id, toString=false) {
  var i = -1;
  const ch = '0';
  const str = String(id);
  const len = 24 - str.length;;
  let out = str;
  while (++i < len) {
    out = ch + out;
  }
  return toString ? ObjectID(out).toString() : ObjectID(out);
}