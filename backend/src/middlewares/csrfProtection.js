const ApiError = require('../utils/ApiError');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const csrfProtection = (req, res, next) => {
    if (SAFE_METHODS.has(req.method)) {
        return next();
    }

    if (req.get('X-Requested-With') !== 'XMLHttpRequest') {
        return next(new ApiError(403, 'Forbidden'));
    }

    next();
};

module.exports = csrfProtection;
