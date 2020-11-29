const fs = require('fs');
// @ts-ignore
const pkgJSON = require('../package.json');

const config = {
  uri: {
    test: {
      connectionString: 'mongodb://localhost/test_cloudstore'
    },
    development: {
      connectionString: 'mongodb://localhost/dev_cloudstore'
      // connectionString: fs.readFileSync(`/etc/nodeapp/${pkgJSON.name}/mongodb`).toString()
    },
    production: {
      // connectionString: process.env.MONGODB_URI
      connectionString: fs.readFileSync(`/etc/nodeapp/${pkgJSON.name}/mongodb`).toString()
    }
  },
  options: {
    keepAlive: 30000, // in ms. Defaults to 30s
    connectTimeoutMS: 30000 // in ms. Defaults to 30s
  }
};

module.exports = config;
