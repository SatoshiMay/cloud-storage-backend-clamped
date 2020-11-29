const { CustomError } = require('./error-util');

const validate = schema => async (req, res, next) => {
  const { error } = schema.validate(req);
  if (error) {
    return next(new CustomError(400, error.message));
  }
  return next();
};

module.exports = validate;
