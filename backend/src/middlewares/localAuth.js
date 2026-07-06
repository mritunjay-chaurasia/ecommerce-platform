const passport = require('../config/passport');
const ApiError = require('../utils/ApiError');

const localAuth = (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return next(new ApiError(401, info?.message || 'Invalid email or password'));
        }
        req.user = user;
        next();
    })(req, res, next);
};

module.exports = localAuth;
