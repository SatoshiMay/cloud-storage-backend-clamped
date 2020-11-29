const User = require('../models/user.model');
const faker = require('faker');
const config = require('../config/aws-config');
const log = require('../lib/logger');
const querystring = require('querystring');

const MIN_RECORDS = 1000000;
const NUM_RECORDS = 100;

// Define the data
const AVATARS = [
  'model-face-beautiful-black-and-white-407035.jpeg',
  'pexels-photo-220453.jpeg',
  'pexels-photo-355164.jpeg',
  'pexels-photo-415829.jpeg',
  'pexels-photo-428331.jpeg',
  'pexels-photo-428341.jpeg',
  'pexels-photo-614810.jpeg',
  'pexels-photo-733872.jpeg',
  'default-profile.jpeg'
];
function createRealUsers(origin) {
  return [
    {
      // _id: new mongoose.Types.ObjectId('000000000000000000000001'),
      _id: '50ca2b94-a4be-4a5b-bd56-db5ce79b1b38',
      firstName: 'Ravi',
      lastName: 'Agarwal',
      'cognito:username': 'ravi2',
      email: 'ravi@ravi.com',
      iss: `https://cognito-idp.${config.Cognito.region}.amazonaws.com/${config.Cognito.userPoolId}`,
      avatar: `${origin}/${querystring.escape(AVATARS[0])}`
    }
  ];
}

function createFakeUser(origin) {
  return {
    _id: faker.random.uuid(),
    firstName: faker.name.findName(),
    lastName: faker.name.lastName(),
    'cognito:username': faker.internet.userName(),
    email: faker.internet.email(),
    iss: `https://cognito-idp.${config.Cognito.region}.amazonaws.com/${config.Cognito.userPoolId}`,
    avatar: `${origin}/${querystring.escape(AVATARS[Math.floor(Math.random() * AVATARS.length)])}`
  };
}

function getOrigin(store) {
  switch (store) {
    case 'local':
      return 'http://localhost:3000';
    case 's3':
      return `https://s3-${config.S3.region}.amazonaws.com/${config.S3.signParams.Bucket}`;
    default:
      throw new Error(`File store of type ${store.type} not valid`);
  }
}

// async function makeFriends() {
//   // /* eslint-disable no-await-in-loop */
//   const users = await User.find().exec();
//   const promises = users.map(user => User
//     .find({ _id: { $ne: user._id } }, '-_id sub')
//     .skip(Math.floor(Math.random() * NUM_RECORDS))
//     .limit(Math.floor(Math.random() * 100)).exec()
//     .then(friends => User
//       .update({ _id: user._id }, { friends: friends.map(f => f.sub) }).exec()));
//   /* eslint-enable no-await-in-loop */
//   return Promise.all(promises);
// }

/**
 * Faster makeFriends compared to one before by operating on batch sizes of 1000.
 * Friends are randomly picked from within a batch and updated before moving to next batch
 */
async function makeFriends() {
  const BATCH_SIZE = 1000;
  const NUM_FRIENDS = 10;
  const cursor = User.find().batchSize(BATCH_SIZE).cursor();
  let user = await cursor.next();
  while (user != null) {
    const users = [];
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < BATCH_SIZE && user != null; i += 1, user = await cursor.next()) {
      users.push(user);
    }
    const bulkOperation = [];
    users.forEach((u) => {
      const rand = Math.floor(Math.random() * users.length);
      // pick random friends
      const friends = users
        .slice(rand, rand + Math.floor(Math.random() * NUM_FRIENDS)); // approximation
      bulkOperation.push({
        updateOne: {
          filter: { _id: u._id },
          update: { $push: { friends: { $each: friends.map(f => f._id) } } }
        }
      });
      friends.forEach(f => bulkOperation.push({
        updateOne: {
          filter: { _id: f._id },
          update: { $push: { friends: u._id } }
        }
      }));
    });
    await User.bulkWrite(bulkOperation);
    /* eslint-enable no-await-in-loop */
  }
}

module.exports = async (store) => {
  // ***IMPORTANT - DO NOT DO THIS IN PRODUCTION***
  if (process.env.NODE_ENV === 'development') {
    const count = await User.count({}).exec();
    if (count < MIN_RECORDS) {
      // await mongoose.connection.dropCollection('User');
      // await User.collection.drop();
      await User.remove({}).exec();
      const realUsers = createRealUsers(getOrigin(store));
      const users = [].concat(realUsers);

      for (let i = 0; i < NUM_RECORDS - realUsers.length; i += 1) {
        users.push(createFakeUser(getOrigin(store)));
      }
      const inserted = await User.insertMany(users);

      await makeFriends();

      log.a(`Inserted ${inserted.length} users`);
    }
  }
};
