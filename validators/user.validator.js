const valMw = require('../lib/validate-mw');
const Joix = require('../lib/joi');
const { catchWrap } = require('../lib/error-util');

// req schema for get to /users/:id/images
const _getUsr = Joix.object().keys({
  headers: Joix.object().keys(undefined),
  params: Joix.object().keys({
    id: Joix.string().uuid().required()
  }),
  query: Joix.object().keys({}),
  body: Joix.object().keys({})
}).unknown();

// req schema for get to /users/:id/images
const _getUsrImgs = Joix.object().keys({
  headers: Joix.object().keys(undefined),
  params: Joix.object().keys({
    id: Joix.string().uuid().required()
  }),
  query: Joix.object().keys({}),
  body: Joix.object().keys({})
}).unknown();

// req schema for post to /users/:id/images
const _postUsrImgs = Joix.object().keys({
  params: Joix.object().keys({
    id: Joix.string().uuid().required()
  }),
  body: Joix.object().keys({
    key: Joix.string().required(),
    mimeType: Joix.string().mimeType().required(),
    store: Joix.object().keys({
      type: Joix.string().valid('s3').required(),
      name: Joix.string().valid('storage.cloudstore.com').required(),
      region: Joix.string().valid('us-west-1').required()
    })
  })
}).unknown();

// req schema for get to /users/0/images
const _getS3Signature = Joix.object().keys({
  query: Joix.object().keys({
    fileName: Joix.string().required(),
    fileType: Joix.string().mimeType().required()
  })
}).unknown();

const _getUsrSearch = Joix.object().keys({
  query: Joix.object().keys({
    term: Joix.string().required()
  })
}).unknown();

const _getUsrPosts = Joix.object().keys({
  params: Joix.object().keys({
    id: Joix.string().uuid().required()
  }),
  query: Joix.object().keys({
    limit: Joix.number().required(),
    page: Joix.number().required()
  })
}).unknown();

module.exports = {
  getUsr: catchWrap(valMw(_getUsr)),
  getUsrImgs: catchWrap(valMw(_getUsrImgs)),
  postUsrImgs: catchWrap(valMw(_postUsrImgs)),
  getS3Signature: catchWrap(valMw(_getS3Signature)),
  getUsrSearch: catchWrap(valMw(_getUsrSearch)),
  getUsrPosts: catchWrap(valMw(_getUsrPosts))
};
