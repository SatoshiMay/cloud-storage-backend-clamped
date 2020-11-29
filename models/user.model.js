const mongoose = require('mongoose');
const aclSchema = require('./acl.model');

const { Schema } = mongoose;

const userSchema = new Schema({
  _id: String,
  firstName: String,
  lastName: String,
  'cognito:username': String,
  email: String,
  avatar: String,
  iss: String,
  friends: [{ type: String, ref: 'User' }],
  owner: String,
  acl: aclSchema
});

userSchema.index({ firstName: 'text', lastName: 'text' });

userSchema.pre('save', function preSave(next) {
  if (!this.owner) {
    this.owner = this._id;
  }
  next();
});

/**
 * insertMany hook takes docs as the second argument.
 * This is not detailed presently in the mongoose documentation
 * See this link: https://github.com/Automattic/mongoose/issues/5064
 */
userSchema.pre('insertMany', function preInsertMany(next, docs) { // eslint-disable-line prefer-arrow-callback
  docs.forEach((doc) => {
    if (!doc.owner) {
      doc.owner = doc._id; // eslint-disable-line no-param-reassign
    }
  });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;

