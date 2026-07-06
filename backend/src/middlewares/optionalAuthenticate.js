const passport = require('../config/passport');

const optionalAuthenticate = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err) {
            return next(err);
        }

        if (user) {
            req.user = user;
        }

        next();
    })(req, res, next);
};

module.exports = optionalAuthenticate;
