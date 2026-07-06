const Joi = require('joi');
const { createObjectIdSchema } = require('./common.schema');
const { RETURN_REQUEST_STATUS_VALUES } = require('../../../../shared/constants/return');

const orderIdParamsSchema = Joi.object({
    orderId: createObjectIdSchema('order id').required(),
});

const createReturnRequestSchema = Joi.object({
    reason: Joi.string().trim().min(10).max(1000).required()
        .messages({
            'string.min': 'Please provide at least 10 characters explaining your return reason',
            'any.required': 'Return reason is required',
        }),
});

const returnIdParamsSchema = Joi.object({
    id: createObjectIdSchema('return request id').required(),
});

const updateReturnRequestSchema = Joi.object({
    status: Joi.string().valid(...RETURN_REQUEST_STATUS_VALUES).required(),
    adminNotes: Joi.string().trim().max(1000).allow(''),
});

const listReturnRequestsQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid(...RETURN_REQUEST_STATUS_VALUES).allow(''),
    search: Joi.string().trim().max(120).allow(''),
});

module.exports = {
    orderIdParamsSchema,
    createReturnRequestSchema,
    returnIdParamsSchema,
    updateReturnRequestSchema,
    listReturnRequestsQuerySchema,
};
