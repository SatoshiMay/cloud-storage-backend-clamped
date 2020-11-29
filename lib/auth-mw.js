const jwt = require('jsonwebtoken');
const { jwks, region, userPoolId } = require('../config/aws-config').Cognito;
const jwkToPem = require('jwk-to-pem');
const { catchWrap, CustomError } = require('./error-util');

// convert jwk base64 to pem
const pems = jwks.keys
  .reduce((acc, { kid, kty, n, e }) => { acc[kid] = jwkToPem({ kty, n, e }); return acc; }, {}); // eslint-disable-line

const authMiddleware = async (req, res, next) => {
  if (!req.get('Authorization')) throw new CustomError(401, 'Unauthorized');

  const token = req.get('Authorization').split(' ')[1];
  /** @type{Object} */
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded) throw new CustomError(401, 'Unauthorized');

  const { header: { kid }, payload: { token_use } } = decoded; // eslint-disable-line
  if (!kid) throw new CustomError(401, 'Unauthorized');

  if (token_use !== 'id') throw new CustomError(401, 'Unauthorized'); // eslint-disable-line

  const optsMap = { issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}` };

  jwt.verify(token, pems[kid], optsMap, (err, payload) => {
    if (err) return next(new CustomError(401, err.message));
    // @ts-ignore
    req.user = payload;
    return next();
  });
};

module.exports = catchWrap(authMiddleware);
