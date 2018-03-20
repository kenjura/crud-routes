const genericApi = require('../../lib');
const Koa        = require('koa');
const mongoose   = require('mongoose');
const Router     = require('koa-router');
const User       = require('./model/User');

mongoose.connect('mongodb://localhost/generic-api-library');

const app = new Koa();
const router = new Router();

genericApi.koa(router, '/user', User);

app.use(router.routes());

const port = process.env.PORT || 3001;

const server = app.listen(port, () => console.log('koa is listening on port ', port));

module.exports = app;
module.exports.server = server;