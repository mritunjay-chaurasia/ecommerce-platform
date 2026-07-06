const User = require('../models/auth.model');
const generateAccessToken = require('./generateToken');
const { generateRefreshTokenPair } = require('./refreshToken');
const { setAuthCookies } = require('./authCookie');
const parseExpiry = require('./parseExpiry');

const issueAuthTokens = async (res, user) => {
    const accessToken = generateAccessToken(user);
    const { token: refreshToken, hashedToken } = generateRefreshTokenPair();
    const refreshMs = parseExpiry(process.env.JWT_REFRESH_EXPIRES_IN || '7d');

    const currentUser = await User.findById(user._id).select('+refreshToken');
    const update = {
        refreshToken: hashedToken,
        refreshTokenExpires: new Date(Date.now() + refreshMs),
    };

    if (currentUser?.refreshToken) {
        update.previousRefreshToken = currentUser.refreshToken;
    }

    await User.findByIdAndUpdate(user._id, update);

    setAuthCookies(res, accessToken, refreshToken);

    return accessToken;
};

module.exports = issueAuthTokens;
