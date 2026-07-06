const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const bcrypt = require('bcrypt');
const User = require('../models/auth.model');
const configureGoogleOAuth = require('./googleOAuth');
const { AUTH_COOKIE_NAME } = require('../constants/cookies');
const { JWT_ISSUER, JWT_AUDIENCE } = require('../constants/jwt');

const INVALID_CREDENTIALS = 'Invalid email or password';

const extractJwtFromRequest = (req) => {
    if (req?.cookies?.[AUTH_COOKIE_NAME]) {
        return req.cookies[AUTH_COOKIE_NAME];
    }

    return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        session: false,
    },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email }).select('+password');

            if (!user || user.authProvider !== 'local') {
                return done(null, false, { message: INVALID_CREDENTIALS });
            }

            if (!user.isActive || user.accountStatus !== 'active') {
                return done(null, false, { message: INVALID_CREDENTIALS });
            }

            if (!user.password) {
                return done(null, false, { message: INVALID_CREDENTIALS });
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return done(null, false, { message: INVALID_CREDENTIALS });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    },
));

passport.use(new JwtStrategy(
    {
        jwtFromRequest: extractJwtFromRequest,
        secretOrKey: process.env.JWT_SECRET,
        algorithms: ['HS256'],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
    },
    async (payload, done) => {
        try {
            const user = await User.findById(payload.id);

            if (!user || !user.isActive || user.accountStatus !== 'active') {
                return done(null, false);
            }

            if ((payload.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
                return done(null, false, { message: 'Session expired. Please login again.' });
            }

            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    },
));

configureGoogleOAuth();

module.exports = passport;
