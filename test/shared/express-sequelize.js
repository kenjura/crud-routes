const datagrid   = require('../../lib/helper/datagrid');
const genericApi = require('../../lib');
const express    = require('express');
const Sequelize  = require('sequelize');
const user       = require('./model/user');

const sequelize = new Sequelize('mysql://crudroutes:crudroutes@localhost:3306/crudroutes');
const User = user(sequelize, Sequelize);

const app = express();

const router = express.Router();

genericApi.options.dialect = 'sql';

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