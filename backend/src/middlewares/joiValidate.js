const ApiError = require('../utils/ApiError');

const joiValidate = (schema, property = 'body') => (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true,
    });

    if (error) {
        const errors = error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message,
        }));
        const err = new ApiError(400, errors.map((e) => e.message).join(', '));
        err.errors = errors;
        return next(err);
    }

    req[property] = value;
    next();
};

module.exports = joiValidate;
