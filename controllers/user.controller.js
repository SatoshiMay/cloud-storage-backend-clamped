const User = require('../models/user.model');
const Image = require('../models/image.model');
const Post = require('../models/post.model');
const aws = require('../lib/aws');
const _ = require('lodash');
const config = require('../config/aws-config').S3;
// const uuidv4 = require('uuid/v4');

const { CustomError } = require('../lib/error-util');

const { catchWrap } = require('../lib/error-util');

const _getUsr = async (req, res) => {
  const user = await User
    .findById(req.params.id, '_id firstName lastName avatar').exec();

  return res.json(user);
};

const _getUsrImgs = async (req, res, next) => {
  const images = await Image
    .find({ owner: req.params.id }, '-_id src description thumbnail acl').exec();

  res.locals.resources = images.map(img => ({
    response: _.pick(img, ['src', 'description', 'thumbnail']),
    ..._.pick(img, ['acl'])
  }));
  return next();
};

const _postUsrImgs = async (req, res) => {
  const headers = await aws.headObject({ Bucket: req.body.store.name, Key: req.body.key });
  const image = new Image({
    ...req.body,
    owner: req.params.id,
    src: aws.uri2Url(req.body.key, req.body.store.name, req.body.store.region),
    // thumbnail: aws.uri2Url(req.body.key, req.body.store.name, req.body.store.region),
    bytes: headers.ContentLength
  });
  const saved = await image.save();
  return res.json({ url: saved.src });
};

const _getS3Signature = async (req, res, next) => {
  const signParams = {
    Key: req.query.fileName, // uuidv4(), // 'fixedKey',
    ContentType: req.query.fileType,
    ...config.signParams
  };
  aws.signS3Url('putObject', signParams, (err, signedUrl) => {
    if (err) {
      return next(new CustomError(400, err.message));
    }
    const meta = {
      saveDetails: {
        key: signParams.Key,
        mimeType: signParams.ContentType,
        store: { type: 's3', name: config.signParams.Bucket, region: config.region }
      },
      putParams: config.putParams
    };
    return res.json({ signedUrl, meta });
  });
};

const _getUsrSearch = async (req, res) => {
  const result = await User
    .find({ $text: { $search: req.query.term } }, '_id firstName lastName avatar')
    .exec();
  return res.json(result);
};

const _getUsrFriends = async (req, res) => {
  const result = await User
    .findById(req.params.id, '-_id friends')
    .populate('friends', '_id firstName lastName avatar').exec();

  return res.json(result.friends);
};

const _getUsrPosts = async (req, res) => {
  const posts = await Post
    .find({ to: req.params.id, isReply: false }, '_id message likes from created')
    .skip(+req.query.page * +req.query.limit).limit(+req.query.limit)
    .populate('from', '_id firstName lastName avatar')
    .populate({
      path: 'replies',
      select: '_id message likes replyTo from created',
      populate: { path: 'from', select: '_id firstName lastName avatar' }
    })
    .exec();
  // console.log(posts.map(post => post.toJSON()));
  res.json(posts);
};

const _postUsrReply = async (req, res) => {
  const saved = await Post.create({
    to: req.params.id,
    from: req.params.id,
    owner: req.params.id,
    message: req.body.reply,
    isReply: true,
    replyTo: req.params.pid,
    likes: 0
  });
  const reply = await Post.findById(saved._id, '_id message likes replyTo from')
    .populate('from', '_id firstName lastName avatar');
  // console.log(reply.toJSON());
  res.json(reply);
};

module.exports = {
  getUsr: catchWrap(_getUsr),
  getUsrImgs: catchWrap(_getUsrImgs),
  postUsrImgs: catchWrap(_postUsrImgs),
  getS3Signature: catchWrap(_getS3Signature),
  getUsrSearch: catchWrap(_getUsrSearch),
  getUsrFriends: catchWrap(_getUsrFriends),
  getUsrPosts: catchWrap(_getUsrPosts),
  postUsrReply: catchWrap(_postUsrReply)
};
