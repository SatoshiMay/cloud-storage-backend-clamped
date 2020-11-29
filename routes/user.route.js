const express = require('express');

const router = express.Router();
const acl = require('../acl/user.acl');
const schema = require('../validators/user.validator');
const handler = require('../controllers/user.controller');

router.get('/search', schema.getUsrSearch, handler.getUsrSearch);

router.get('/:id', schema.getUsr, handler.getUsr);

router.get('/:id/images', schema.getUsrImgs, acl.inGetUsrImgs, handler.getUsrImgs, acl.exitGetUsrImgs);

router.post('/:id/images', schema.postUsrImgs, acl.inGetUsrImgs, handler.postUsrImgs);

router.get('/:id/images/s3-signature', schema.getS3Signature, handler.getS3Signature);

router.get('/:id/friends', handler.getUsrFriends);

router.get('/:id/posts', schema.getUsrPosts, handler.getUsrPosts);

router.post('/:id/posts/:pid', handler.postUsrReply);

module.exports = router;
