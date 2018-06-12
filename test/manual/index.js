// const server = require('../shared/express-server');
const server = require('../shared/express-sequelize');


server.get('/', (req,res) => res.send(`
  <h3>generic-api-library</h3>
  <p>This is an express app for testing generic-api-library.</p>
  <p><a href="/user">user api</a></p>
`));
