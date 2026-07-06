const Joi = require('joi');
const { imagePathSchema } = require('./image.schema');

const baseProductSchema = {
    name: Joi.string().trim().min(2).max(120).required()
        .messages({
            'string.empty': 'Product name is required',
            'string.min': 'Product name must be at least 2 characters',
        }),
    description: Joi.string().trim().max(2000).allow('')
        .messages({
            'string.max': 'Description cannot exceed 2000 characters',
        }),
    category: Joi.string().trim().required()
        .messages({
            'string.empty': 'Category is required',
        }),
    brand: Joi.string().trim().max(80).allow(''),
    sku: Joi.string().trim().min(2).max(60).required()
        .messages({
            'string.empty': 'SKU is required',
            'string.min': 'SKU must be at least 2 characters',
        }),
    price: Joi.number().min(0).required()
        .messages({
            'number.base': 'Price must be a number',
            'any.required': 'Price is required',
        }),
    salePrice: Joi.number().min(0).allow(null)
        .messages({
            'number.base': 'Sale price must be a number',
        }),
    stockQuantity: Joi.number().integer().min(0).required()
        .messages({
            'number.base': 'Stock quantity must be a number',
            'number.integer': 'Stock quantity must be a whole number',
            'any.required': 'Stock quantity is required',
        }),
    imageUrls: Joi.array().items(imagePathSchema).max(10).default([]),
    isActive: Joi.boolean().default(true),
    isFeatured: Joi.boolean().default(false),
};

const createProductSchema = Joi.object(baseProductSchema)
    .custom((value, helpers) => {
        if (value.salePrice !== null && value.salePrice !== undefined && value.salePrice > value.price) {
            return helpers.error('any.custom');
        }

        return value;
    })
    .messages({
        'any.custom': 'Sale price cannot be greater than price',
    });

const updateProductSchema = Joi.object({
    name: Joi.string().trim().min(2).max(120),
    description: Joi.string().trim().max(2000).allow(''),
    category: Joi.string().trim(),
    brand: Joi.string().trim().max(80).allow(''),
    sku: Joi.string().trim().min(2).max(60),
    price: Joi.number().min(0),
    salePrice: Joi.number().min(0).allow(null),
    stockQuantity: Joi.number().integer().min(0),
    imageUrls: Joi.array().items(imagePathSchema).max(10),
    isActive: Joi.boolean(),
    isFeatured: Joi.boolean(),
}).min(1)
    .custom((value, helpers) => {
        if (
            value.salePrice !== undefined
            && value.price !== undefined
            && value.salePrice !== null
            && value.salePrice > value.price
        ) {
            return helpers.error('any.custom');
        }

        return value;
    })
    .messages({
        'any.custom': 'Sale price cannot be greater than price',
    });

module.exports = {
    createProductSchema,
    updateProductSchema,
};
