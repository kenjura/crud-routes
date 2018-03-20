const chai           = require('chai');
const chaiAsPromised = require('chai-as-promised');
const objectId       = require('../../shared/helper/objectId');
const ops            = require('../../../lib/helper/mongooseOperations');
const User           = require('../../shared/model/User');

const { expect } = chai;
const { ObjectID } = require('mongodb');


chai.use(chaiAsPromised);

describe('mongooseOperations.find', async () => {
  beforeEach(injectTestData);
  const args = { filters:{}, model:User, options:{} };

  it('finds the right number of users with default args', async () => {
    const result = await ops.find(args);
    expect(result.data).to.be.ok;
    expect(result.data).to.have.length(5);
  });
  it('finds the right number of users with filter args', async () => {
    const result = await ops.find(Object.assign({}, args, { filters:{ companyName:'Rebel Alliance'} }));
    expect(result.data).to.be.ok;
    expect(result.data).to.have.length(3);
  });
  it('finds the right number of users with regex filter', async () => {
    const result = await ops.find(Object.assign({}, args, { filters:{ firstName:/^L/ } }));
    expect(result.data).to.be.ok;
    expect(result.data).to.have.length(2);
    expect(result.data.map(d => d.firstName)).to.eql([ 'Leia', 'Luke' ]);
  });
  it('counts records correctly', async () => {
    const result = await ops.find(Object.assign({}, args, { limit:1, filters:{ companyName:'Rebel Alliance'} }));
    expect(result.data).to.be.ok;
    expect(result.filterCount).to.eq(3);
    expect(result.totalCount).to.eq(5);
  });
  it('sorts users correctly', async () => {
    const result = await ops.find(Object.assign({}, args, { sort: 'companyName -lastName' }));
    expect(result.data).to.be.ok;
    expect(result.data.map(d => d.firstName)).to.have.eql([ 'Jabba', 'Darth', 'Luke', 'Leia', 'Gial' ]);
  });
  it('limits and offsets correctly', async () => {
    const result1 = await ops.find(Object.assign({}, args, { limit:1, offset: 0 }));
    const result2 = await ops.find(Object.assign({}, args, { limit:1, offset: 1 }));
    expect(result1.data).to.be.ok;
    expect(result1.data).to.have.length(1);
    expect(result1.data[0].firstName).to.eq('Darth');
    expect(result2.data).to.be.ok;
    expect(result2.data).to.have.length(1);
    expect(result2.data[0].firstName).to.eq('Gial');
  });
  it('limits fields correctly', async () => {
    const result = await ops.find(Object.assign({}, args, { select:{ firstName:1, lastName:1 } }));
    expect(result.data).to.be.ok;
    expect(result.data).to.have.length(5);
    expect(result.data[0].firstName).to.equal('Darth');
    expect(result.data[0].username).to.not.be.ok;
  });
});

describe('mongooseOperations.findOne', async () => {
  beforeEach(injectTestData);
  const args = { filters:{}, model:User, options:{} };

  it('finds records correctly', async () => {
    const result = await ops.findOne(Object.assign({}, args, { params: { _id:objectId(4) } }));
    expect(result.data).to.be.ok;
    expect(result.data.username).to.eq('lskywalker@rebellion.com');
  })
});

describe('mongooseOperations.create', async () => {
  beforeEach(injectTestData);
  const args = { filters:{}, model:User, options:{} };

  it('creates records correctly', async () => {
    const body = {
      firstName: 'Han',
      lastName: 'Solo',
      username: 'hsolo@millenniumfalcon.com',
      companyName: 'Han Solo, LLC',
    };
    const result = await ops.create(Object.assign({}, args, { body }));
    expect(result.data).to.be.ok;
    expect(result.data.firstName).to.eq('Han');

    const result2 = await User.find().exec();
    expect(result2).to.be.ok;
    expect(result2).to.have.length(6);
    expect(result2[5].firstName).to.eq('Han');
  })
});

describe('mongooseOperations.update', async () => {
  beforeEach(injectTestData);
  const args = { filters:{}, model:User, options:{} };

  it('creates records correctly', async () => {
    const body = { lastName: 'Solo', companyName: 'New Republic' };
    const params = { _id:objectId(3) };
    const result = await ops.update(Object.assign({}, args, { body, params }));
    expect(result.data).to.be.ok;
    expect(result.data.firstName).to.eq('Leia');
    expect(result.data.lastName).to.eq('Solo');

    const result2 = await User.find({ firstName:'Leia' }).exec();
    expect(result2).to.be.ok;
    expect(result2).to.have.length(1);
    expect(result2[0].lastName).to.eq('Solo');
  })
});

describe('mongooseOperations.remove', async () => {
  beforeEach(injectTestData);
  const args = { filters:{}, model:User, options:{} };

  it('creates records correctly', async () => {
    const params = { _id:objectId(5) };
    const result = await ops.remove(Object.assign({}, args, { params }));
    expect(result.data).to.be.ok;
    expect(result.data.firstName).to.eq('Jabba');

    const result2 = await User.find({ }).exec();
    expect(result2).to.be.ok;
    expect(result2).to.have.length(4);
  })
});

describe('mongooseOperations.removeMany', async () => {
  beforeEach(injectTestData);
  const args = { filters:{}, model:User, options:{} };

  it('does not run if no filters are present', async () => {
    expect(ops.removeMany(args)).to.be.rejectedWith('Filters are required to use this endpoint.');
  })
  it('removes the right number of records', async () => {
    const filters = { username:/rebellion/ };
    const result = await ops.removeMany(Object.assign({}, args, { filters }));
    expect(result).to.be.ok;
    expect(result.data).to.be.ok;
    expect(result.data).to.have.length(3);

    const result2 = await User.find().exec();
    expect(result2).to.be.ok;
    expect(result2.map(d => d.firstName)).to.eql(['Darth','Jabba']);
  });
});

async function injectTestData() {
  await User.remove({});
  await User.insertMany(getTestData());
}

function getTestData() {
  return [
    { _id:objectId(1), username:'dvader@empire.com',        firstName:'Darth', lastName:'Vader',     companyName:'Galactic Empire' },
    { _id:objectId(2), username:'aackbar@rebellion.com',    firstName:'Gial',  lastName:'Ackbar',    companyName:'Rebel Alliance' },
    { _id:objectId(3), username:'lorgana@rebellion.com',    firstName:'Leia',  lastName:'Organa',    companyName:'Rebel Alliance' },
    { _id:objectId(4), username:'lskywalker@rebellion.com', firstName:'Luke',  lastName:'Skywalker', companyName:'Rebel Alliance' },
    { _id:objectId(5), username:'jtiure@tatooine.com',      firstName:'Jabba', lastName:'the Hutt',  companyName:'Desilijic Kajidic' },
  ]
}