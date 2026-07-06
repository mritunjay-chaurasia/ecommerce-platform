const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/auth.model');
const { ROLES } = require('../constants/roles');

const configureGoogleOAuth = () => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return;
    }

    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value?.toLowerCase();

                if (!email) {
                    return done(null, false, { message: 'Google account has no email' });
                }

                let user = await User.findOne({
                    $or: [{ googleId: profile.id }, { email }],
                });

                if (user) {
                    if (user.authProvider === 'local' && !user.googleId) {
                        return done(null, false, {
                            message: 'An account with this email already exists. Please login with email and password.',
                        });
                    }

                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.isEmailVerified = true;
                        if (profile.photos?.[0]?.value) {
                            user.avatar = profile.photos[0].value;
                        }
                        await user.save();
                    }
                } else {
                    const [firstName, ...rest] = (profile.displayName || 'Google User').split(' ');

                    user = await User.create({
                        firstName,
                        lastName: rest.join(' ') || 'User',
                        email,
                        googleId: profile.id,
                        authProvider: 'google',
                        avatar: profile.photos?.[0]?.value || null,
                        isEmailVerified: true,
                        role: ROLES.CUSTOMER,
                    });
                }

                if (!user.isActive || user.accountStatus !== 'active') {
                    return done(null, false, { message: 'Your account has been deactivated' });
                }

                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        },
    ));
};

module.exports = configureGoogleOAuth;
