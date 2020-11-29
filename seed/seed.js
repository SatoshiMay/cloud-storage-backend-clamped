const db = require('../models/db');
const seedUser = require('./seed-user');
const seedImage = require('./seed-image');
const seedPost = require('./seed-post');
const log = require('../lib/logger');

const store = 'local'; // local

(async () => {
  // ***IMPORTANT - DO NOT DO THIS IN PRODUCTION***
  if (process.env.NODE_ENV === 'development') {
    db.connect(process.env.NODE_ENV)
      .then(() => seedUser(store))
      .then(() => seedImage(store))
      .then(() => seedPost())
      .then(
        () => log.a('Seeded database successfully!'),
        err => log.a(`Error seeding database\n ${err}`)
      )
      .then(() => db.disconnect());
  }
})();
