// 'use strict';
const mongoose = require('mongoose');
const config = require('../config/mongoose-config');
const log = require('../lib/logger');
const { URL } = require('url');

module.exports = {
  connect(env) {
    const url = new URL(config.uri[env].connectionString);

    return mongoose.connect(url.toString(), config.options).then(
      () => { log.a(`Mongoose connected successfully to ${url.host}${url.pathname}`); },
      (err) => { log.e(`Mongoose initial connection error\n ${err}`); }
    );
  },

  disconnect() {
    return mongoose.disconnect().then(
      () => { log.a('Mongoose connection closed'); },
      (err) => { log.e(`Error closing mongoose connection\n ${err}`); }
    );
  }
};
