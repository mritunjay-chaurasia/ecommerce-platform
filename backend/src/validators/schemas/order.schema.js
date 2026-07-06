const Joi = require('joi');
const {
    ORDER_STATUS_VALUES,
    PAYMENT_STATUS_VALUES,
} = require('../../models/order.model');

const objectIdSchema = Joi.string().trim().hex().length(24)
    .messages({
        'string.hex': 'Invalid order id',
        'string.length': 'Invalid order id',
    });

const listOrdersQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    search: Joi.string().trim().allow(''),
    orderStatus: Joi.string().valid(...ORDER_STATUS_VALUES).allow(''),
    paymentStatus: Joi.string().valid(...PAYMENT_STATUS_VALUES).allow(''),
});

const orderIdParamsSchema = Joi.object({
    id: objectIdSchema.required(),
});

const updateOrderStatusSchema = Joi.object({
    orderStatus: Joi.string().valid(...ORDER_STATUS_VALUES),
    paymentStatus: Joi.string().valid(...PAYMENT_STATUS_VALUES),
    trackingNumber: Joi.string().trim().max(120).allow(''),
    notes: Joi.string().trim().max(1000).allow(''),
}).min(1);

module.exports = {
    listOrdersQuerySchema,
    orderIdParamsSchema,
    updateOrderStatusSchema,
};
