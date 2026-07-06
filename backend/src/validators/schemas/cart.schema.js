const Joi = require('joi');
const { createObjectIdSchema } = require('./common.schema');

const cartItemPayloadSchema = Joi.object({
    productId: createObjectIdSchema('product id').required(),
    quantity: Joi.number().integer().min(1).max(999).default(1),
});

const updateCartQuantitySchema = Joi.object({
    quantity: Joi.number().integer().min(0).max(999).required(),
});

const productIdParamsSchema = Joi.object({
    productId: createObjectIdSchema('product id').required(),
});

const mergeCartSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            productId: createObjectIdSchema('product id').required(),
            quantity: Joi.number().integer().min(1).max(999).required(),
        }),
    ).min(1).max(100).required(),
});

module.exports = {
    cartItemPayloadSchema,
    updateCartQuantitySchema,
    productIdParamsSchema,
    mergeCartSchema,
};
