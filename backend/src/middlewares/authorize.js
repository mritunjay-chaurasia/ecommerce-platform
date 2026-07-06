const ApiError = require('../utils/ApiError');
const { ROLES } = require('../constants/roles');

const authorize = (...roles) => (req, res, next) => {
    if (!req.user) {
        return next(new ApiError(401, 'Unauthorized'));
    }

    if (roles.length && !roles.includes(req.user.role)) {
        return next(new ApiError(403, 'You do not have permission to perform this action'));
    }

    next();
};

authorize.admin = authorize(ROLES.ADMIN);
authorize.customer = authorize(ROLES.CUSTOMER);

module.exports = authorize;
