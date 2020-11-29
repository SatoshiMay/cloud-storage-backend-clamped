const User = require('../models/user.model');
const { getRole } = require('../lib/rbac');
const { catchWrap, CustomError } = require('../lib/error-util');

const _inGetUsrImgs = async (req, res, next) => {
  const rbac = await User.findById(req.params.id).select('-_id owner friends acl').exec();
  res.locals.rbac = { role: getRole(req.user.sub, rbac) };
  if (!rbac.acl[res.locals.rbac.role].GET) {
    return res.json([]);
  }
  return next();
};

const _exitGetUsrImgs = async (req, res) => {
  const { resources } = res.locals;
  const filtered = resources.filter(resource => resource.acl[res.locals.rbac.role].GET);
  const response = filtered.map(resource => resource.response);
  return res.json(response);
};

const _inPostUsrImgs = async (req, res, next) => {
  const rbac = await User.findById(req.params.id).select('-_id owner friends acl').exec();
  res.locals.rbac = { role: getRole(req.user.sub, rbac) };
  if (!rbac.acl[res.locals.role].POST) {
    return next(new CustomError(401, `Post with role:${res.locals.rbac.role} not allowed`));
  }
  return next();
};

module.exports = {
  inGetUsrImgs: catchWrap(_inGetUsrImgs),
  exitGetUsrImgs: catchWrap(_exitGetUsrImgs),
  inPostUsrImgs: catchWrap(_inPostUsrImgs)
};
