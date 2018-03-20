const mongoose     = require('mongoose');

const { Mixed, ObjectId } = mongoose.Schema.Types;

const collectionName = 'users';
const schemaName = 'user';

const schema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    companyName: String,
    roles: { type: Array },
    permissions: { type: Object },
    passwordHash: { type: String },
    passwordSalt: { type: String },
    datePasswordChanged: { type: Date },
    passwordResetToken: { type: String },
    passwordResetRequestTimestamp: { type: Date },
    mustChangePassword: { type: Boolean },
  }
);

schema.virtual('isAdmin').get(function() {
  return this.roles.includes('admin')
})



module.exports = mongoose.model(schemaName, schema, collectionName);
