class CustomError extends Error {
  constructor(status, ...params) {
    super(...params);
    this.status = status;
  }
}

const catchWrap = asyncFn => (req, res, next) => asyncFn(req, res, next).catch(next);

module.exports = { CustomError, catchWrap };
