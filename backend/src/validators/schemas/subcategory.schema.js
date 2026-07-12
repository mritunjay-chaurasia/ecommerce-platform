const Joi = require('joi');
const { createOptionalPaginationQuerySchema, createObjectIdSchema } = require('./common.schema');

const listSubcategoriesQuerySchema = createOptionalPaginationQuerySchema({ maxLimit: 50 }).keys({
    category: createObjectIdSchema('category id'),
    isActive: Joi.boolean(),
});

const createSubcategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(80).required()
        .messages({
            'string.empty': 'Subcategory name is required',
            'string.min': 'Subcategory name must be at least 2 characters',
        }),
    description: Joi.string().trim().max(300).allow(''),
    category: createObjectIdSchema('category id').required(),
    isActive: Joi.boolean().default(true),
});

const updateSubcategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(80),
    description: Joi.string().trim().max(300).allow(''),
    isActive: Joi.boolean(),
}).min(1);

module.exports = {
    listSubcategoriesQuerySchema,
    createSubcategorySchema,
    updateSubcategorySchema,
};
