const crypto = require('crypto');

const generateResetToken = () => {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    return { token, hashedToken };
};

const hashResetToken = (token) => crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

module.exports = { generateResetToken, hashResetToken };
