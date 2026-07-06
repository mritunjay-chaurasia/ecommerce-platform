const issueAuthTokens = require('../utils/issueAuthTokens');

const googleCallback = async (req, res) => {
    const user = req.user;

    user.lastLoginAt = new Date();
    await user.save();

    await issueAuthTokens(res, user);

    const redirectUrl = new URL('/auth/callback', process.env.FRONTEND_URL);
    redirectUrl.searchParams.set('success', '1');

    return res.redirect(redirectUrl.toString());
};

const googleFailure = (req, res) => {
    const redirectUrl = new URL('/login', process.env.FRONTEND_URL);
    redirectUrl.searchParams.set('error', 'oauth_failed');
    return res.redirect(redirectUrl.toString());
};

module.exports = { googleCallback, googleFailure };
