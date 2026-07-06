const Joi = require('joi');
const { DISCOUNT_TYPE_VALUES } = require('../../models/coupon.model');
const { COUPON_STATUS_VALUES, COUPON_CODE_REGEX } = require('../../../../shared/constants/coupon');
const { moneySchema, isoDateSchema } = require('./common.schema');

const couponCodeSchema = Joi.string().trim().uppercase().min(3).max(40)
    .pattern(COUPON_CODE_REGEX)
    .messages({
        'string.empty': 'Coupon code is required',
        'string.min': 'Coupon code must be at least 3 characters',
        'string.max': 'Coupon code cannot exceed 40 characters',
        'string.pattern.base': 'Coupon code can contain only letters, numbers, hyphens, and underscores',
    });

const validateCouponRules = (value, helpers) => {
    if (value.discountValue !== undefined && value.discountValue <= 0) {
        return helpers.error('any.custom', {
            message: 'Discount value must be greater than 0',
        });
    }

    if (value.discountType === 'percentage' && value.discountValue > 100) {
        return helpers.error('any.custom', {
            message: 'Percentage discount cannot be greater than 100',
        });
    }

    if (value.maxDiscountAmount !== undefined && value.maxDiscountAmount !== null && value.maxDiscountAmount <= 0) {
        return helpers.error('any.custom', {
            message: 'Maximum discount amount must be greater than 0 when provided',
        });
    }

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

const couponMessages = {
    'any.custom': '{{#message}}',
};

const baseCouponFields = {
    code: couponCodeSchema.required(),
    description: Joi.string().trim().max(300).allow('')
        .messages({
            'string.max': 'Description cannot exceed 300 characters',
        }),
    discountType: Joi.string().valid(...DISCOUNT_TYPE_VALUES).required()
        .messages({
            'any.only': 'Discount type must be percentage or fixed',
            'string.empty': 'Discount type is required',
        }),
    discountValue: moneySchema.required()
        .messages({
            'number.base': 'Discount value must be a number',
            'any.required': 'Discount value is required',
        }),
    minOrderAmount: moneySchema.default(0)
        .messages({
            'number.base': 'Minimum order amount must be a number',
        }),
    maxDiscountAmount: moneySchema.allow(null)
        .messages({
            'number.base': 'Maximum discount amount must be a number',
        }),
    usageLimit: Joi.number().integer().min(1).allow(null)
        .messages({
            'number.base': 'Usage limit must be a number',
            'number.integer': 'Usage limit must be a whole number',
        }),
    startsAt: isoDateSchema,
    expiresAt: isoDateSchema,
    isActive: Joi.boolean().default(true),
};

const couponIdParamsSchema = Joi.object({
    id: Joi.string().trim().hex().length(24).required()
        .messages({
            'string.hex': 'Invalid coupon id',
            'string.length': 'Invalid coupon id',
            'any.required': 'Coupon id is required',
        }),
});

const listCouponsQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    search: Joi.string().trim().max(120).allow(''),
    status: Joi.string().valid(...COUPON_STATUS_VALUES).allow(''),
});

const createCouponSchema = Joi.object(baseCouponFields)
    .custom(validateCouponRules)
    .messages(couponMessages);

const updateCouponSchema = Joi.object({
    code: couponCodeSchema,
    description: Joi.string().trim().max(300).allow(''),
    discountType: Joi.string().valid(...DISCOUNT_TYPE_VALUES),
    discountValue: moneySchema,
    minOrderAmount: moneySchema,
    maxDiscountAmount: moneySchema.allow(null),
    usageLimit: Joi.number().integer().min(1).allow(null),
    startsAt: isoDateSchema,
    expiresAt: isoDateSchema,
    isActive: Joi.boolean(),
}).min(1)
    .custom(validateCouponRules)
    .messages(couponMessages);

module.exports = {
    listCouponsQuerySchema,
    couponIdParamsSchema,
    createCouponSchema,
    updateCouponSchema,
};
