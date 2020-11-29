const Joi = require('joi');
const validator = require('validator');

const Joix = Joi.extend([
  joi => ({
    base: joi.string(),
    name: 'string',
    language: { mimeType: 'is equal to "{{v}}" which is not a valid mime-type' }, // Used below as 'number.round'
    rules: [{
      name: 'mimeType',
      validate(params, value, state, options) {
        // @ts-ignore
        if (!validator.isMimeType(value)) {
          return this.createError('string.mimeType', { v: value }, state, options);
        }
        return value;
      }
    }]
  }),
  joi => ({
    base: joi.string(),
    name: 'string',
    language: { uuid: 'is equal to "{{v}}" which is not a valid uuid' }, // Used below as 'number.round'
    rules: [{
      name: 'uuid',
      validate(params, value, state, options) {
        if (!validator.isUUID(value)) {
          return this.createError('string.uuid', { v: value }, state, options);
        }
        return value;
      }
    }]
  })
]);

module.exports = Joix;
