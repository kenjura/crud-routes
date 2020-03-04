const datagrid   = require('../../lib/helper/datagrid');
const genericApi = require('../../lib');
const express    = require('express');
const mongoose   = require('mongoose');
const User       = require('./model/User');

mongoose.connect('mongodb://localhost/generic-api-library');

const app = express();

const router = express.Router();

genericApi(router, '/user', User);
// genericApi(router, '/user', User, {
//   render: async (req, res) => {
//     res.send(datagrid({
//       data: res.result.data.map(d => d.toObject())
//     }));
//   }
// });

app.use(router);

const port = process.env.PORT || 3000;

const httpServer = app.listen(port, () => console.log('app is listening on port ', port));

module.exports = app;
module.exports.close = function() {
  httpServer.close();
}