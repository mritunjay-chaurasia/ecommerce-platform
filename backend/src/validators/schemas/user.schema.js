const Joi = require('joi');
const passwordSchema = require('./password.schema');
const { ROLE_VALUES } = require('../../constants/roles');

const signupSchema = Joi.object({
    firstName: Joi.string().trim().min(2).max(30).required()
        .messages({
            'string.empty': 'First name is required',
            'string.min': 'First name must be at least 2 characters',
        }),
    lastName: Joi.string().trim().min(1).max(30).required()
        .messages({
            'string.empty': 'Last name is required',
        }),
    email: Joi.string().trim().lowercase().email().required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email',
        }),
    password: passwordSchema,
    phone: Joi.string().trim().pattern(/^[0-9]{10}$/).required()
        .messages({
            'string.empty': 'Phone is required',
            'string.pattern.base': 'Phone must be a 10-digit number',
        }),
    gender: Joi.string().valid('male', 'female', 'other').required()
        .messages({
            'any.only': 'Gender must be male, female, or other',
            'string.empty': 'Gender is required',
        }),
});

const updateProfileSchema = Joi.object({
    firstName: Joi.string().trim().min(2).max(30),
    lastName: Joi.string().trim().min(1).max(30),
    phone: Joi.string().trim().pattern(/^[0-9]{10}$/)
        .messages({ 'string.pattern.base': 'Phone must be a 10-digit number' }),
    gender: Joi.string().valid('male', 'female', 'other'),
    avatar: Joi.string()
        .uri({ scheme: ['https'] })
        .allow(null, ''),
}).min(1);

const resetPasswordSchema = Joi.object({
    token: Joi.string().required()
        .messages({ 'string.empty': 'Reset token is required' }),
    password: passwordSchema,
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
        .messages({
            'any.only': 'Passwords do not match',
            'string.empty': 'Confirm password is required',
        }),
});

const updateUserStatusSchema = Joi.object({
    blocked: Joi.boolean().required()
        .messages({
            'any.required': 'Blocked status is required',
            'boolean.base': 'Blocked must be true or false',
        }),
});

const updateUserVerificationSchema = Joi.object({
    emailVerified: Joi.boolean()
        .messages({
            'boolean.base': 'Email verified must be true or false',
        }),
    phoneVerified: Joi.boolean()
        .messages({
            'boolean.base': 'Phone verified must be true or false',
        }),
}).or('emailVerified', 'phoneVerified')
    .messages({
        'object.missing': 'At least one verification field is required',
    });

const updateUserRoleSchema = Joi.object({
    role: Joi.string().valid(...ROLE_VALUES).required()
        .messages({
            'any.only': 'Role must be customer or admin',
            'any.required': 'Role is required',
        }),
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required()
        .messages({
            'string.empty': 'Current password is required',
        }),
    newPassword: passwordSchema,
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
        .messages({
            'any.only': 'Passwords do not match',
            'string.empty': 'Confirm password is required',
        }),
});

module.exports = {
    signupSchema,
    updateProfileSchema,
    resetPasswordSchema,
    updateUserStatusSchema,
    updateUserVerificationSchema,
    updateUserRoleSchema,
    changePasswordSchema,
};
