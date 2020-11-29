const aws = require('./aws');

module.exports = (app) => {
  app.set('env', process.env.NODE_ENV || 'development');

  app.locals.uri2Url = (uri, store) => {// eslint-disable-line
    switch (store.type) {
      case 'local':
        return `http://localhost:${app.get('port')}/${uri}`;
      case 's3':
        return aws.uri2Url(uri, store.name);
      default:
        throw new Error(`File store of type ${store.type} not valid`);
    }
  };
};
