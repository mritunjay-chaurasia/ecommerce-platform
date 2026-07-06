const Joi = require('joi');
const { REVIEW_STATUS_VALUES } = require('../../models/review.model');

const objectIdSchema = Joi.string().trim().hex().length(24)
    .messages({
        'string.hex': 'Invalid id',
        'string.length': 'Invalid id',
        'any.required': 'Id is required',
    });

const listReviewsQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    search: Joi.string().trim().max(120).allow(''),
    status: Joi.string().valid(...REVIEW_STATUS_VALUES).allow(''),
    productId: objectIdSchema.allow(''),
});

const reviewIdParamsSchema = Joi.object({
    id: objectIdSchema.required(),
});

const updateReviewStatusSchema = Joi.object({
    status: Joi.string().valid(...REVIEW_STATUS_VALUES).required()
        .messages({
            'any.only': 'Status must be pending, approved, hidden, or rejected',
            'string.empty': 'Status is required',
        }),
});

const createReviewSchema = Joi.object({
    productId: objectIdSchema.required()
        .messages({
            'any.required': 'Product is required',
        }),
    rating: Joi.number().integer().min(1).max(5).required()
        .messages({
            'number.base': 'Rating must be a number',
            'number.integer': 'Rating must be a whole number',
            'number.min': 'Rating must be at least 1',
            'number.max': 'Rating cannot be greater than 5',
            'any.required': 'Rating is required',
        }),
    title: Joi.string().trim().max(120).allow('')
        .messages({
            'string.max': 'Title cannot exceed 120 characters',
        }),
    comment: Joi.string().trim().min(3).max(1000).required()
        .messages({
            'string.empty': 'Comment is required',
            'string.min': 'Comment must be at least 3 characters',
            'string.max': 'Comment cannot exceed 1000 characters',
        }),
});

const productIdParamsSchema = Joi.object({
    productId: objectIdSchema.required(),
});

const myReviewQuerySchema = Joi.object({
    productId: objectIdSchema.required(),
});

module.exports = {
    listReviewsQuerySchema,
    reviewIdParamsSchema,
    updateReviewStatusSchema,
    createReviewSchema,
    productIdParamsSchema,
    myReviewQuerySchema,
};
