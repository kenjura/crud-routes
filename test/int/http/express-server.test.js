const objectId = require('../../shared/helper/objectId');
const request  = require('supertest');
const server   = require('../../shared/express-server');
const User     = require('../../shared/model/User');

const { expect } = require('chai');

beforeEach(injectTestData);

async function injectTestData() {
  await User.remove({});
  await User.insertMany(getTestData());
}

describe('express server > find endpoint (/user)', async () => {
  it('returns the right number of records', () => {
    return request(server)
      .get('/user')
      .then(res => {
        expect(res.body).to.have.length(5);
        expect(res.body).to.not.have.length(4);
      })
  });
  it('returns the right number of records with a filter', () => {
    return request(server)
      .get('/user?companyName=Rebel Alliance')
      .then(res => {
        expect(res.body).to.have.length(3);
      })
  });
  it('returns the right number of records with a regex filter');
  it('counts records correctly');
  it('limits and offsets correctly');
  it('limits fields correctly');
});

describe('express server > findOne endpoint (/user/:id)', async () => {
  it('finds the user requested', () => {
    return request(server)
      .get(`/user/${objectId(4)}`)
      .then(res => {
        expect(res.body.firstName).to.eq('Luke');
      });
  })
});

describe('express server > create endpoint (POST /user)', async () => {
  it('creates the user requested');
})

describe('express server > update endpoint (PUT /user/:id)', async () => {
  it('updates the user requested');
})

describe('express server > upsertMany endpoint (PUT /user)', async () => {
  it('inserts and updates as requested');
})

describe('express server > remove endpoint (DELETE /user/:id)', async () => {
  it('deletes the user requested');
})

describe('express server > removeMany endpoint (DELETE /user?filters)', async () => {
  it('deletes the users requested');
})

after(async () => {
  server.close();
})


function getTestData() {
  return [
    { _id:objectId(1), username:'dvader@empire.com',        firstName:'Darth', lastName:'Vader',     companyName:'Galactic Empire' },
    { _id:objectId(2), username:'aackbar@rebellion.com',    firstName:'Gial',  lastName:'Ackbar',    companyName:'Rebel Alliance' },
    { _id:objectId(3), username:'lorgana@rebellion.com',    firstName:'Leia',  lastName:'Organa',    companyName:'Rebel Alliance' },
    { _id:objectId(4), username:'lskywalker@rebellion.com', firstName:'Luke',  lastName:'Skywalker', companyName:'Rebel Alliance' },
    { _id:objectId(5), username:'jtiure@tatooine.com',      firstName:'Jabba', lastName:'the Hutt',  companyName:'Desilijic Kajidic' },
  ]
}