const Joi = require('joi');
const { CURRENCY_VALUES } = require('../../models/settings.model');

const moneySchema = Joi.number().min(0).precision(2)
    .messages({
        'number.base': 'Value must be a number',
        'number.min': 'Value must be 0 or greater',
        'number.precision': 'Value can have at most 2 decimal places',
    });

const updateStoreSettingsSchema = Joi.object({
    storeName: Joi.string().trim().min(2).max(80).required()
        .messages({
            'string.empty': 'Store name is required',
            'string.min': 'Store name must be at least 2 characters',
            'string.max': 'Store name cannot exceed 80 characters',
        }),
    contactEmail: Joi.string().trim().email({ tlds: { allow: false } }).allow('')
        .messages({
            'string.email': 'Contact email must be a valid email address',
            'string.max': 'Contact email cannot exceed 120 characters',
        }),
    contactPhone: Joi.string().trim().max(20).allow('')
        .messages({
            'string.max': 'Contact phone cannot exceed 20 characters',
        }),
    supportAddress: Joi.string().trim().max(300).allow('')
        .messages({
            'string.max': 'Support address cannot exceed 300 characters',
        }),
    currency: Joi.string().valid(...CURRENCY_VALUES).required()
        .messages({
            'any.only': 'Currency must be INR, USD, or EUR',
            'string.empty': 'Currency is required',
        }),
    taxRate: Joi.number().min(0).max(100).precision(2).required()
        .messages({
            'number.base': 'Tax rate must be a number',
            'number.min': 'Tax rate must be 0 or greater',
            'number.max': 'Tax rate cannot exceed 100',
        }),
    freeShippingThreshold: moneySchema.required()
        .messages({
            'any.required': 'Free shipping threshold is required',
        }),
    standardShippingFee: moneySchema.required()
        .messages({
            'any.required': 'Standard shipping fee is required',
        }),
    returnPolicy: Joi.string().trim().max(2000).allow('')
        .messages({
            'string.max': 'Return policy cannot exceed 2000 characters',
        }),
});

module.exports = {
    updateStoreSettingsSchema,
};
