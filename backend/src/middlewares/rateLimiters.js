const rateLimit = require('express-rate-limit');

const shouldSkipRateLimit = () => process.env.NODE_ENV === 'test'
    || process.env.NODE_ENV === 'development';

const createLimiter = ({ windowMs, limit, message, skip }) => rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        if (shouldSkipRateLimit()) {
            return true;
        }

        if (typeof skip === 'function' && skip(req)) {
            return true;
        }

        return req.method === 'OPTIONS' || req.method === 'HEAD';
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message,
        });
    },
});

const authLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: 'Too many authentication attempts. Please try again later.',
});

const signupLimiter = createLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: 'Too many signup attempts. Please try again later.',
});

const forgotPasswordLimiter = createLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    message: 'Too many password reset requests. Please try again later.',
});

const resetPasswordLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: 'Too many password reset attempts. Please try again later.',
});

const refreshLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    message: 'Too many token refresh attempts. Please try again later.',
});

const oauthLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    message: 'Too many OAuth attempts. Please try again later.',
});

const adminLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    message: 'Too many admin requests. Please try again later.',
});

const generalApiLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_MAX) || 500,
    message: 'Too many requests, please try again later.',
});

module.exports = {
    authLimiter,
    signupLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter,
    refreshLimiter,
    oauthLimiter,
    adminLimiter,
    generalApiLimiter,
};
