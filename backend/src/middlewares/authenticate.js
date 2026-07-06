const passport = require('../config/passport');
const ApiError = require('../utils/ApiError');

const authenticate = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return next(new ApiError(401, info?.message || 'Unauthorized'));
        }
        req.user = user;
        next();
    })(req, res, next);
};

module.exports = authenticate;
