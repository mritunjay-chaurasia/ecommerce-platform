const Joi = require('joi');
const { PLACEMENT_VALUES } = require('../../models/banner.model');
const { imagePathSchema } = require('./image.schema');

const BANNER_STATUS_VALUES = ['active', 'inactive', 'scheduled', 'expired'];

const objectIdSchema = Joi.string().trim().hex().length(24)
    .messages({
        'string.hex': 'Invalid banner id',
        'string.length': 'Invalid banner id',
        'any.required': 'Banner id is required',
    });

const isoDateSchema = Joi.date().iso().allow(null)
    .messages({
        'date.format': 'Date must be a valid ISO date',
        'date.base': 'Date must be a valid date',
    });

const validateBannerRules = (value, helpers) => {
    if (
        value.startsAt
        && value.expiresAt
        && new Date(value.startsAt).getTime() > new Date(value.expiresAt).getTime()
    ) {
        return helpers.error('any.custom', {
            message: 'Expiry date must be after the start date',
        });
    }

    return value;
};

const bannerMessages = {
    'any.custom': '{{#message}}',
};

const baseBannerFields = {
    title: Joi.string().trim().min(2).max(120).required()
        .messages({
            'string.empty': 'Title is required',
            'string.min': 'Title must be at least 2 characters',
            'string.max': 'Title cannot exceed 120 characters',
        }),
    tag: Joi.string().trim().max(60).allow('')
        .messages({
            'string.max': 'Tag cannot exceed 60 characters',
        }),
    subtitle: Joi.string().trim().max(300).allow('')
        .messages({
            'string.max': 'Subtitle cannot exceed 300 characters',
        }),
    imageUrl: imagePathSchema.allow(''),
    buttonText: Joi.string().trim().max(40).allow('')
        .messages({
            'string.max': 'Button text cannot exceed 40 characters',
        }),
    placement: Joi.string().valid(...PLACEMENT_VALUES).default('hero')
        .messages({
            'any.only': 'Placement must be hero or promo',
        }),
    sortOrder: Joi.number().integer().min(0).max(9999).default(0)
        .messages({
            'number.base': 'Sort order must be a number',
            'number.integer': 'Sort order must be a whole number',
            'number.min': 'Sort order must be 0 or greater',
            'number.max': 'Sort order cannot exceed 9999',
        }),
    startsAt: isoDateSchema,
    expiresAt: isoDateSchema,
    isActive: Joi.boolean().default(true),
};

const bannerIdParamsSchema = Joi.object({
    id: objectIdSchema.required(),
});

const listBannersQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    search: Joi.string().trim().max(120).allow(''),
    status: Joi.string().valid(...BANNER_STATUS_VALUES).allow(''),
    placement: Joi.string().valid(...PLACEMENT_VALUES).allow(''),
});

const listStoreBannersQuerySchema = Joi.object({
    placement: Joi.string().valid(...PLACEMENT_VALUES).default('hero'),
});

const createBannerSchema = Joi.object(baseBannerFields)
    .custom(validateBannerRules)
    .messages(bannerMessages);

const updateBannerSchema = Joi.object({
    title: Joi.string().trim().min(2).max(120),
    tag: Joi.string().trim().max(60).allow(''),
    subtitle: Joi.string().trim().max(300).allow(''),
    imageUrl: imagePathSchema.allow(''),
    buttonText: Joi.string().trim().max(40).allow(''),
    placement: Joi.string().valid(...PLACEMENT_VALUES),
    sortOrder: Joi.number().integer().min(0).max(9999),
    startsAt: isoDateSchema,
    expiresAt: isoDateSchema,
    isActive: Joi.boolean(),
}).min(1)
    .custom(validateBannerRules)
    .messages(bannerMessages);

module.exports = {
    listBannersQuerySchema,
    listStoreBannersQuerySchema,
    bannerIdParamsSchema,
    createBannerSchema,
    updateBannerSchema,
};
