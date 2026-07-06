const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

const OAUTH_STATE_COOKIE = 'oauth_state';
const OAUTH_STATE_MAX_AGE = 10 * 60 * 1000;

const getOAuthStateCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true' || isProduction,
        sameSite: process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax'),
        path: '/api/auth/google/callback',
        maxAge: OAUTH_STATE_MAX_AGE,
    };
};

const signOAuthState = (state) => {
    const signature = crypto
        .createHmac('sha256', process.env.JWT_SECRET)
        .update(state)
        .digest('hex');

    return `${state}.${signature}`;
};

const verifySignedOAuthState = (signedState) => {
    if (!signedState || typeof signedState !== 'string') {
        return null;
    }

    const [state, signature] = signedState.split('.');

    if (!state || !signature) {
        return null;
    }

    const expectedSignature = crypto
        .createHmac('sha256', process.env.JWT_SECRET)
        .update(state)
        .digest('hex');

    if (signature.length !== expectedSignature.length) {
        return null;
    }

    try {
        const isValid = crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex'),
        );

        return isValid ? state : null;
    } catch {
        return null;
    }
};

const initiateOAuthState = (req, res, next) => {
    const state = crypto.randomBytes(32).toString('hex');
    res.cookie(OAUTH_STATE_COOKIE, signOAuthState(state), getOAuthStateCookieOptions());
    req.oauthState = state;
    next();
};

const verifyOAuthState = (req, res, next) => {
    const stateFromQuery = req.query.state;
    const stateFromCookie = verifySignedOAuthState(req.cookies[OAUTH_STATE_COOKIE]);

    res.clearCookie(OAUTH_STATE_COOKIE, getOAuthStateCookieOptions());

    if (!stateFromQuery || !stateFromCookie || stateFromQuery !== stateFromCookie) {
        return next(new ApiError(403, 'Invalid OAuth state'));
    }

    next();
};

module.exports = {
    initiateOAuthState,
    verifyOAuthState,
};
