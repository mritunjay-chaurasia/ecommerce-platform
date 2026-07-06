const Joi = require('joi');
const { createObjectIdSchema, addressFieldsSchema } = require('./common.schema');

const addressIdSchema = createObjectIdSchema('address id');

const createAddressSchema = Joi.object(addressFieldsSchema);

const updateAddressSchema = Joi.object(addressFieldsSchema).min(1);

const addressIdParamsSchema = Joi.object({
    id: addressIdSchema.required(),
});

module.exports = {
    createAddressSchema,
    updateAddressSchema,
    addressIdParamsSchema,
};
