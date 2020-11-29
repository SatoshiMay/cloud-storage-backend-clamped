const request = require('sync-request');

const config = {
  Cognito: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_Gg8HwMcuO',
    get jwks() {
      const url = `https://cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}/.well-known/jwks.json`;
      // @ts-ignore
      return JSON.parse(request('GET', url).getBody());
    }
  },
  S3: {
    apiVersion: '2006-03-01',
    region: 'us-west-1',
    signParams: {
      Bucket: 'storage.cloudstore.com',
      ACL: 'public-read',
      Expires: 900 // seconds
    },
    putParams: {
      'Cache-Control': 'max-age=2592000' // 30 days
    }
  }
};

module.exports = config;
