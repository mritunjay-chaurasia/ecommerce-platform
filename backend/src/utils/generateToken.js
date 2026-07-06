const jwt = require('jsonwebtoken');
const { JWT_ISSUER, JWT_AUDIENCE } = require('../constants/jwt');

const getTokenPayload = (user) => ({
    id: user._id,
    role: user.role,
    tokenVersion: user.tokenVersion ?? 0,
});

const generateAccessToken = (user) => jwt.sign(
    getTokenPayload(user),
    process.env.JWT_SECRET,
    {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        algorithm: 'HS256',
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
    },
);

module.exports = generateAccessToken;
module.exports.generateAccessToken = generateAccessToken;
