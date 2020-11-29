const User = require('../models/user.model');
const Image = require('../models/image.model');
const faker = require('faker');
const config = require('../config/aws-config');
const log = require('../lib/logger');
const querystring = require('querystring');

const MIN_RECORDS = 1000000;
const NUM_RECORDS = 1000;

const IMAGES = [
  'fall-autumn-red-season.jpg',
  'pexels-photo-127513.jpeg',
  'pexels-photo-210186.jpeg',
  'pexels-photo-66997.jpeg',
  'pexels-photo-248771.jpeg',
  'pexels-photo-248797.jpeg'
];

// Define the data
async function createImage(n, origin) {
  const [user] = await User.find().skip(n).limit(1).exec();
  const key = IMAGES[Math.floor(Math.random() * IMAGES.length)];
  return {
    key,
    // 'mime-type': 'image/jpeg',
    store: { type: 'local' },
    src: `${origin}/${querystring.escape(key)}`,
    owner: user._id,
    description: faker.lorem.sentence()
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

module.exports = async (store) => {
  // ***IMPORTANT - DO NOT DO THIS IN PRODUCTION***
  if (process.env.NODE_ENV === 'development') {
    const count = await Image.count({}).exec();
    if (count < MIN_RECORDS) {
      await Image.remove({}).exec();
      const images$ = [];
      const n = await User.count({}).exec();

      for (let i = 0; i < NUM_RECORDS; i += 1) {
        const image$ = createImage(Math.floor(Math.random() * n), getOrigin(store));
        images$.push(image$);
      }
      const inserted = await Image.insertMany(await Promise.all(images$));
      log.a(`Inserted ${inserted.length} images`);
    }
  }
};
