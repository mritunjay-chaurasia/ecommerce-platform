const Joi = require('joi');

const PRODUCT_ID_SCHEMA = Joi.string().trim().hex().length(24)
    .messages({
        'string.hex': 'Invalid product id',
        'string.length': 'Invalid product id',
        'any.required': 'Product id is required',
    });

const INVENTORY_STATUS_VALUES = ['in_stock', 'low_stock', 'out_of_stock'];

const listInventoryQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    search: Joi.string().trim().max(120).allow(''),
    category: Joi.string().trim().hex().length(24).allow(''),
    inventoryStatus: Joi.string().valid(...INVENTORY_STATUS_VALUES).allow(''),
    isActive: Joi.boolean(),
});

const productIdParamsSchema = Joi.object({
    id: PRODUCT_ID_SCHEMA.required(),
});

const updateProductStockSchema = Joi.object({
    stockQuantity: Joi.number().integer().min(0).required()
        .messages({
            'number.base': 'Stock quantity must be a number',
            'number.integer': 'Stock quantity must be a whole number',
            'number.min': 'Stock quantity must be 0 or greater',
            'any.required': 'Stock quantity is required',
        }),
}).required();

module.exports = {
    INVENTORY_STATUS_VALUES,
    listInventoryQuerySchema,
    productIdParamsSchema,
    updateProductStockSchema,
};
