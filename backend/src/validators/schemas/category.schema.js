const Joi = require('joi');

const createCategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(80).required()
        .messages({
            'string.empty': 'Category name is required',
            'string.min': 'Category name must be at least 2 characters',
        }),
    description: Joi.string().trim().max(300).allow('')
        .messages({
            'string.max': 'Description cannot exceed 300 characters',
        }),
    isActive: Joi.boolean().default(true),
});

const updateCategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(80),
    description: Joi.string().trim().max(300).allow(''),
    isActive: Joi.boolean(),
}).min(1);

module.exports = {
    createCategorySchema,
    updateCategorySchema,
};
