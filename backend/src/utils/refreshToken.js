const crypto = require('crypto');

const generateRefreshTokenPair = () => {
    const token = crypto.randomBytes(48).toString('hex');
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    return { token, hashedToken };
};

const hashRefreshToken = (token) => crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

module.exports = {
    generateRefreshTokenPair,
    hashRefreshToken,
};
