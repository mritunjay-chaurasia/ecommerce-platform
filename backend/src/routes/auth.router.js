const { Router } = require('express');
const passport = require('passport');
const router = Router();
const {
    login,
    signup,
    refresh,
    logout,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
    changePassword,
} = require('../controllers/auth.controller');
const { googleCallback, googleFailure } = require('../controllers/oauth.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const joiValidate = require('../middlewares/joiValidate');
const expressValidate = require('../middlewares/expressValidate');
const localAuth = require('../middlewares/localAuth');
const authenticate = require('../middlewares/authenticate');
const optionalAuthenticate = require('../middlewares/optionalAuthenticate');
const { initiateOAuthState, verifyOAuthState } = require('../middlewares/oauthState');
const {
    signupSchema,
    updateProfileSchema,
    resetPasswordSchema,
    changePasswordSchema,
} = require('../validators/schemas/user.schema');
const { loginValidator, forgotPasswordValidator } = require('../validators/user.validator');
const {
    authLimiter,
    signupLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter,
    refreshLimiter,
    oauthLimiter,
} = require('../middlewares/rateLimiters');

router.post('/signup', signupLimiter, joiValidate(signupSchema), asyncHandler(signup));
router.post('/login', authLimiter, loginValidator, expressValidate, localAuth, asyncHandler(login));
router.post('/refresh', refreshLimiter, asyncHandler(refresh));
router.post('/logout', optionalAuthenticate, asyncHandler(logout));
router.get('/profile', authenticate, asyncHandler(getProfile));
router.patch('/profile', authenticate, joiValidate(updateProfileSchema), asyncHandler(updateProfile));
router.post('/change-password', authenticate, joiValidate(changePasswordSchema), asyncHandler(changePassword));
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidator, expressValidate, asyncHandler(forgotPassword));
router.post('/reset-password', resetPasswordLimiter, joiValidate(resetPasswordSchema), asyncHandler(resetPassword));

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    router.get('/google',
        oauthLimiter,
        initiateOAuthState,
        (req, res, next) => {
            passport.authenticate('google', {
                scope: ['profile', 'email'],
                session: false,
                state: req.oauthState,
            })(req, res, next);
        },
    );

    router.get('/google/callback',
        oauthLimiter,
        verifyOAuthState,
        passport.authenticate('google', {
            session: false,
            failureRedirect: '/api/auth/google/failure',
            state: false,
        }),
        asyncHandler(googleCallback),
    );

    router.get('/google/failure', googleFailure);
}

module.exports = router;
