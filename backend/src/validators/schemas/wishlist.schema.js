const Joi = require('joi');
const { createObjectIdSchema } = require('./common.schema');

const productIdBodySchema = Joi.object({
    productId: createObjectIdSchema('product id').required(),
});

const productIdParamsSchema = Joi.object({
    productId: createObjectIdSchema('product id').required(),
});

module.exports = {
    productIdBodySchema,
    productIdParamsSchema,
};
