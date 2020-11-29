const User = require('../models/user.model');
const Post = require('../models/post.model');
const faker = require('faker');
const log = require('../lib/logger');

const MIN_RECORDS = 1000000;
const NUM_RECORDS = 1000;

// Define the data
async function createOriginalPost(n1, n2) {
  const [user1] = await User.find().skip(n1).limit(1).exec();
  const [user2] = await User.find().skip(n2).limit(1).exec();
  return {
    to: user1._id,
    from: user2._id,
    isReply: false,
    message: faker.lorem.paragraph(),
    likes: faker.random.number()
  };
}

async function createReply(original, nUsers) {
  const n = Math.floor(Math.random() * nUsers);
  const [user] = await User.find().skip(n).limit(1).exec();
  return {
    to: original.to,
    from: user._id,
    isReply: true,
    replyTo: original._id,
    message: faker.lorem.paragraph(),
    likes: faker.random.number()
  };
}

async function addReplies(nUsers) {
  const NUM_REPLIES = 5;
  const BATCH_SIZE = 1000;
  const cursor = Post.find({ isReply: false }).batchSize(BATCH_SIZE).cursor();
  let post = await cursor.next();
  /* eslint-disable no-await-in-loop */
  while (post != null) {
    const replies$ = [];
    for (let i = 0; i < BATCH_SIZE && post != null; i += 1, post = await cursor.next()) {
      const numReplies = Math.floor(Math.random() * (NUM_REPLIES + 1));
      for (let j = 0; j < numReplies; j += 1) {
        replies$.push(createReply(post, nUsers));
      }
    }
    await Post.insertMany(await Promise.all(replies$));
  }
  /* eslint-enable no-await-in-loop */
}

module.exports = async () => {
  // ***IMPORTANT - DO NOT DO THIS IN PRODUCTION***
  if (process.env.NODE_ENV === 'development') {
    const count = await Post.count({}).exec();
    if (count < MIN_RECORDS) {
      await Post.remove({}).exec();
      const posts$ = [];
      const nUsers = await User.count({}).exec();

      for (let i = 0; i < NUM_RECORDS; i += 1) {
        const post$ = createOriginalPost(
          Math.floor(Math.random() * nUsers),
          Math.floor(Math.random() * nUsers)
        );
        posts$.push(post$);
      }
      const inserted = await Post.insertMany(await Promise.all(posts$));

      await addReplies(nUsers);

      log.a(`Inserted ${inserted.length} posts`);
    }
  }
};
