module.exports = class SqlOperationError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, SqlOperationError);
  }
};