const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const expressValidate = (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
        const errors = result.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));
        const err = new ApiError(400, errors.map((e) => e.message).join(', '));
        err.errors = errors;
        return next(err);
    }

    next();
};

module.exports = expressValidate;
