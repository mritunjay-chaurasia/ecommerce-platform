const Joi = require('joi');

const UPLOAD_PATH_REGEX = /^\/uploads\/[\w.-]+$/;
const HTTPS_URL_REGEX = /^https:\/\/.+/i;

const imagePathSchema = Joi.string().trim().max(500)
    .custom((value, helpers) => {
        if (!value) {
            return value;
        }

        if (UPLOAD_PATH_REGEX.test(value) || HTTPS_URL_REGEX.test(value)) {
            return value;
        }

        return helpers.error('any.invalid');
    })
    .messages({
        'any.invalid': 'Image must be an uploaded file or a valid https URL',
        'string.max': 'Image path cannot exceed 500 characters',
    });

module.exports = {
    imagePathSchema,
    UPLOAD_PATH_REGEX,
};
