const Joi = require('joi');
const { PHONE_REGEX } = require('../../../../shared/constants/validation');

const createObjectIdSchema = (label = 'id') => Joi.string().trim().hex().length(24)
    .messages({
        'string.hex': `Invalid ${label}`,
        'string.length': `Invalid ${label}`,
    });

const phoneSchema = Joi.string().trim().pattern(PHONE_REGEX).required()
    .messages({
        'string.pattern.base': 'Phone number must be a valid 10-digit number',
    });

const moneySchema = Joi.number().min(0).precision(2)
    .messages({
        'number.base': 'Value must be a number',
        'number.min': 'Value must be 0 or greater',
        'number.precision': 'Value can have at most 2 decimal places',
    });

const isoDateSchema = Joi.date().iso().allow(null)
    .messages({
        'date.format': 'Date must be a valid ISO date',
        'date.base': 'Date must be a valid date',
    });

const addressFieldsSchema = {
    label: Joi.string().trim().max(40).allow(''),
    fullName: Joi.string().trim().min(2).max(80).required(),
    phone: phoneSchema,
    line1: Joi.string().trim().min(3).max(120).required(),
    line2: Joi.string().trim().max(120).allow(''),
    city: Joi.string().trim().min(2).max(80).required(),
    state: Joi.string().trim().max(80).allow(''),
    postalCode: Joi.string().trim().max(20).allow(''),
    country: Joi.string().trim().min(2).max(80).required(),
    isDefault: Joi.boolean(),
};

const shippingAddressSchema = Joi.object({
    fullName: addressFieldsSchema.fullName,
    phone: addressFieldsSchema.phone,
    line1: addressFieldsSchema.line1,
    line2: addressFieldsSchema.line2,
    city: addressFieldsSchema.city,
    state: addressFieldsSchema.state,
    postalCode: addressFieldsSchema.postalCode,
    country: addressFieldsSchema.country,
});

const createPaginationQuerySchema = (options = {}) => {
    const { maxLimit = 100, defaultLimit = 10 } = options;

    return Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(maxLimit).default(defaultLimit),
        search: Joi.string().trim().max(120).allow(''),
    });
};

module.exports = {
    createObjectIdSchema,
    phoneSchema,
    moneySchema,
    isoDateSchema,
    addressFieldsSchema,
    shippingAddressSchema,
    createPaginationQuerySchema,
};
