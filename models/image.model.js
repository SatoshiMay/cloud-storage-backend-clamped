const mongoose = require('mongoose');
const aclSchema = require('./acl.model');

const { Schema } = mongoose;

const imageSchema = new Schema({
  key: String,
  'mime-type': String,
  store: Schema.Types.Mixed, // anything goes here, just use markModified to save
  owner: { type: String, ref: 'User', index: true },
  description: String,
  src: String,
  thumbnail: String,
  bytes: Number,
  created: { type: Date, default: Date.now() },
  modified: Date,
  acl: aclSchema
});

imageSchema.pre('save', function preSave(next) {
  if (!this.thumbnail) {
    this.thumbnail = this.src;
  }
  next();
});

/**
 * insertMany hook takes docs as the second argument.
 * This is not detailed presently in the mongoose documentation
 * See this link: https://github.com/Automattic/mongoose/issues/5064
 */
imageSchema.pre('insertMany', function preInsertMany(next, docs) { // eslint-disable-line prefer-arrow-callback
  docs.forEach((doc) => {
    if (!doc.thumbnail) {
      doc.thumbnail = doc.src; // eslint-disable-line no-param-reassign
    }
  });
  next();
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
