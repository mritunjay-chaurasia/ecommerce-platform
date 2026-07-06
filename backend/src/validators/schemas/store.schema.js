const Joi = require('joi');
const { PAYMENT_METHOD_VALUES } = require('../../models/order.model');
const {
    createObjectIdSchema,
    shippingAddressSchema,
} = require('./common.schema');

const productIdSchema = createObjectIdSchema('product id');
const orderIdSchema = createObjectIdSchema('order id');

const cartItemSchema = Joi.object({
    productId: productIdSchema.required()
        .messages({
            'any.required': 'Product id is required',
        }),
    quantity: Joi.number().integer().min(1).required()
        .messages({
            'number.base': 'Quantity must be a number',
            'number.integer': 'Quantity must be a whole number',
            'number.min': 'Quantity must be at least 1',
            'any.required': 'Quantity is required',
        }),
});

const listStoreProductsQuerySchema = Joi.object({
    search: Joi.string().trim().max(120).allow(''),
    category: createObjectIdSchema('category id').allow(''),
    featured: Joi.boolean(),
    sort: Joi.string().valid('newest', 'price_asc', 'price_desc', 'rating').allow(''),
    minPrice: Joi.number().min(0).allow(''),
    maxPrice: Joi.number().min(0).allow(''),
    inStock: Joi.boolean(),
    ids: Joi.string().trim().max(600).allow(''),
});

const checkoutSummarySchema = Joi.object({
    items: Joi.array().items(cartItemSchema).min(1).required(),
    couponCode: Joi.string().trim().uppercase().max(40).allow('', null),
});

const createStoreOrderSchema = Joi.object({
    items: Joi.array().items(cartItemSchema).min(1).required(),
    couponCode: Joi.string().trim().uppercase().max(40).allow('', null),
    shippingAddress: shippingAddressSchema.required(),
    paymentMethod: Joi.string().valid(...PAYMENT_METHOD_VALUES).default('cod'),
    notes: Joi.string().trim().max(1000).allow(''),
});

const orderIdParamsSchema = Joi.object({
    orderId: orderIdSchema.required(),
});

const cancelOrderSchema = Joi.object({
    reason: Joi.string().trim().max(500).allow(''),
});

module.exports = {
    listStoreProductsQuerySchema,
    checkoutSummarySchema,
    createStoreOrderSchema,
    orderIdParamsSchema,
    cancelOrderSchema,
};
