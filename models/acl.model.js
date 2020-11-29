const aclSchema = {
  owner: { GET: { type: Boolean, default: true }, POST: { type: Boolean, default: true } },
  friend: { GET: { type: Boolean, default: true }, POST: { type: Boolean, default: false } },
  other: { GET: { type: Boolean, default: false }, POST: { type: Boolean, default: false } }
};

module.exports = aclSchema;
