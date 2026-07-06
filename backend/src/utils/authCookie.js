const { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } = require('../constants/cookies');
const parseExpiry = require('./parseExpiry');

const REFRESH_COOKIE_PATH = '/api/auth';

const getBaseCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true' || isProduction,
        sameSite: process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax'),
        path: '/',
    };
};

const getAccessCookieOptions = () => ({
    ...getBaseCookieOptions(),
    maxAge: parseExpiry(process.env.JWT_ACCESS_EXPIRES_IN || '15m'),
});

const getRefreshCookieOptions = () => ({
    ...getBaseCookieOptions(),
    path: REFRESH_COOKIE_PATH,
    maxAge: parseExpiry(process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
});

const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie(AUTH_COOKIE_NAME, accessToken, getAccessCookieOptions());
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
};

const setAuthCookie = (res, accessToken) => {
    res.cookie(AUTH_COOKIE_NAME, accessToken, getAccessCookieOptions());
};

const clearAuthCookies = (res) => {
    const accessOptions = { ...getBaseCookieOptions() };
    const refreshOptions = { ...getBaseCookieOptions(), path: REFRESH_COOKIE_PATH };

    res.clearCookie(AUTH_COOKIE_NAME, accessOptions);
    res.clearCookie(REFRESH_COOKIE_NAME, refreshOptions);
};

const clearAuthCookie = clearAuthCookies;

module.exports = {
    AUTH_COOKIE_NAME,
    REFRESH_COOKIE_NAME,
    REFRESH_COOKIE_PATH,
    setAuthCookies,
    setAuthCookie,
    clearAuthCookies,
    clearAuthCookie,
};
