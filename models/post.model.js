const mongoose = require('mongoose');

const { Schema } = mongoose;

const postSchema = new Schema({
  to: { type: String, ref: 'User', index: true },
  from: { type: String, ref: 'User' },
  owner: { type: String },
  message: String,
  isReply: Boolean,
  replyTo: { type: Schema.Types.ObjectId },
  likes: Number,
  created: { type: Date, default: Date.now() },
  modified: Date
}, { toJSON: { virtuals: true } });

postSchema.virtual('replies', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'replyTo'
});

postSchema.pre('save', function preSave(next) {
  if (!this.owner) {
    this.owner = this.from;
  }
  next();
});

/**
 * insertMany hook takes docs as the second argument.
 * This is not detailed presently in the mongoose documentation
 * See this link: https://github.com/Automattic/mongoose/issues/5064
 */
postSchema.pre('insertMany', function preInsertMany(next, docs) { // eslint-disable-line prefer-arrow-callback
  docs.forEach((doc) => {
    if (!doc.owner) {
      doc.owner = doc.from; // eslint-disable-line no-param-reassign
    }
  });
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
