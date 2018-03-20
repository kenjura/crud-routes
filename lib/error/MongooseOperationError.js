module.exports = class MongooseOperationError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, MongooseOperationError);
  }
};