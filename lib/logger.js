const debug = require('debug');

const debugLogger = {
  e: debug('server:error'),
  i: debug('server:info'),
  v: debug('server:verbose'),
  d: debug('server:debug'),
  a: debug('server:always') // always
};

module.exports = debugLogger;
