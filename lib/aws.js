const S3 = require('aws-sdk/clients/s3');
const config = require('../config/aws-config').S3;

const s3 = new S3({
  apiVersion: config.apiVersion,
  region: config.region
});

const signS3Url = (operation, params, cb) => {
  s3.getSignedUrl(operation, params, cb);
};

const headObject = params => s3.headObject(params).promise();

const uri2Url = (uri, bucket, region) => `https://s3-${region}.amazonaws.com/${bucket}/${uri}`;

module.exports = {
  signS3Url,
  headObject,
  uri2Url
};
