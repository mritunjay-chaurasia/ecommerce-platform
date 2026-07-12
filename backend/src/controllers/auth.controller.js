const User = require('../models/auth.model');
const bcrypt = require('bcrypt');
const ApiError = require('../utils/ApiError');
const { generateResetToken, hashResetToken } = require('../utils/resetToken');
const { clearAuthCookies, REFRESH_COOKIE_NAME } = require('../utils/authCookie');
const { hashRefreshToken } = require('../utils/refreshToken');
const issueAuthTokens = require('../utils/issueAuthTokens');
const formatUserResponse = require('../utils/formatUserResponse');
const escapeRegex = require('../utils/escapeRegex');
const { sendEmailSafe } = require('../utils/sendEmail');
const { buildPasswordResetEmail, buildEmailVerificationEmail } = require('../templates/emailTemplates');
const { getStoreSettings } = require('../utils/storeSettings');
const { ROLES } = require('../constants/roles');
const { buildPagination, parsePaginationQuery } = require('../utils/pagination');

const ACCOUNT_EXISTS = 'An account with this email or phone already exists';
const BCRYPT_ROUNDS = 12;
const EMAIL_VERIFICATION_EXPIRY_MS = Number(process.env.EMAIL_VERIFICATION_EXPIRY_MS || 86400000);

const sendEmailVerificationMessage = async (user) => {
    const { token, hashedToken } = generateResetToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS);
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const expiryHours = Math.max(1, Math.round(EMAIL_VERIFICATION_EXPIRY_MS / 3600000));
    const settings = await getStoreSettings();
    const verificationEmail = await buildEmailVerificationEmail({
        storeName: settings.storeName,
        customerName: user.firstName || 'there',
        verifyUrl,
        expiryHours,
    });

    sendEmailSafe({
        to: user.email,
        subject: verificationEmail.subject,
        html: verificationEmail.html,
    });
};

const signup = async (req, res) => {
    const { firstName, lastName, email, password, phone, gender } = req.body;

    const existingUser = await User.findOne({
        $or: [{ email }, { phone }],
    });

    if (existingUser) {
        throw new ApiError(409, ACCOUNT_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        gender,
        role: ROLES.CUSTOMER,
        authProvider: 'local',
    });

    await issueAuthTokens(res, user);

    sendEmailVerificationMessage(user).catch(() => {});

    return res.status(201).json({
        success: true,
        message: 'Account created successfully. Please verify your email.',
        data: formatUserResponse(user),
    });
};

const login = async (req, res) => {
    const user = req.user;

    user.lastLoginAt = new Date();
    await user.save();

    await issueAuthTokens(res, user);

    return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: formatUserResponse(user),
    });
};

const invalidateUserSessions = async (userId) => User.findByIdAndUpdate(userId, {
    $unset: {
        refreshToken: 1,
        refreshTokenExpires: 1,
        previousRefreshToken: 1,
    },
    $inc: { tokenVersion: 1 },
});

const refresh = async (req, res) => {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
        throw new ApiError(401, 'Refresh token missing');
    }

    const hashedToken = hashRefreshToken(refreshToken);
    let user = await User.findOne({
        refreshToken: hashedToken,
        refreshTokenExpires: { $gt: new Date() },
        isActive: true,
        accountStatus: 'active',
    }).select('+refreshToken +refreshTokenExpires +previousRefreshToken');

    if (!user) {
        const reuseUser = await User.findOne({ previousRefreshToken: hashedToken }).select('_id');

        if (reuseUser) {
            await invalidateUserSessions(reuseUser._id);
            clearAuthCookies(res);
            throw new ApiError(401, 'Session compromised. Please login again.');
        }

        clearAuthCookies(res);
        throw new ApiError(401, 'Invalid or expired refresh token');
    }

    await issueAuthTokens(res, user);

    return res.status(200).json({
        success: true,
        message: 'Token refreshed',
    });
};

const logout = async (req, res) => {
    let userId = req.user?._id;

    if (!userId) {
        const refreshToken = req.cookies[REFRESH_COOKIE_NAME];

        if (refreshToken) {
            const hashedToken = hashRefreshToken(refreshToken);
            const user = await User.findOne({ refreshToken: hashedToken }).select('_id');
            userId = user?._id;
        }
    }

    if (userId) {
        await invalidateUserSessions(userId);
    }

    clearAuthCookies(res);

    return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};

const getProfile = async (req, res) => {
    return res.status(200).json({
        success: true,
        data: formatUserResponse(req.user),
    });
};

const updateProfile = async (req, res) => {
    const allowedFields = [
        'firstName',
        'lastName',
        'phone',
        'gender',
        'avatar',
    ];

    if (req.body.phone && req.body.phone !== req.user.phone) {
        const phoneExists = await User.findOne({
            phone: req.body.phone,
            _id: { $ne: req.user._id },
        });

        if (phoneExists) {
            throw new ApiError(409, 'Phone number is already registered');
        }
    }

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            req.user[field] = req.body[field];
        }
    });

    await req.user.save();

    return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: formatUserResponse(req.user),
    });
};

const formatAdminUserRow = (user, now = new Date()) => ({
    id: user._id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    phone: user.phone || '-',
    role: user.role,
    status: user.accountStatus,
    isActive: user.isActive,
    isEmailVerified: Boolean(user.isEmailVerified),
    isPhoneVerified: Boolean(user.isPhoneVerified),
    isLoggedIn: Boolean(user.refreshTokenExpires && user.refreshTokenExpires > now),
    createdAt: user.createdAt,
});

const formatAdminUserDetail = (user, now = new Date()) => ({
    ...formatAdminUserRow(user, now),
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender || null,
    authProvider: user.authProvider || 'local',
    avatar: user.avatar || null,
    lastLoginAt: user.lastLoginAt || null,
    updatedAt: user.updatedAt,
});

const getUsers = async (req, res) => {
    const { page, limit, skip } = parsePaginationQuery(req.query);
    const search = req.query.search?.trim();
    const filter = {
        accountStatus: { $ne: 'deleted' },
        _id: { $ne: req.user._id },
    };

    if (search) {
        const safeSearch = escapeRegex(search);
        filter.$or = [
            { firstName: { $regex: safeSearch, $options: 'i' } },
            { lastName: { $regex: safeSearch, $options: 'i' } },
            { email: { $regex: safeSearch, $options: 'i' } },
            { phone: { $regex: safeSearch, $options: 'i' } },
        ];
    }

    const [users, total] = await Promise.all([
        User.find(filter)
            .select('+refreshTokenExpires firstName lastName email phone role accountStatus isActive isEmailVerified isPhoneVerified createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(filter),
    ]);

    const now = new Date();
    const data = users.map((user) => formatAdminUserRow(user, now));

    return res.status(200).json({
        success: true,
        data,
        pagination: buildPagination(page, limit, total),
    });
};

const getUserById = async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id)
        .select('+refreshTokenExpires firstName lastName email phone gender role accountStatus isActive isEmailVerified isPhoneVerified authProvider avatar lastLoginAt createdAt updatedAt');

    console.log(">>>>>user", user);

    if (!user || user.accountStatus === 'deleted') {
        throw new ApiError(404, 'User not found');
    }

    return res.status(200).json({
        success: true,
        data: formatAdminUserDetail(user),
    });
};

const updateUserStatus = async (req, res) => {
    const { blocked } = req.body;
    const { id } = req.params;

    if (id === String(req.user._id)) {
        throw new ApiError(400, 'You cannot change your own account status');
    }

    const user = await User.findById(id);

    if (!user || user.accountStatus === 'deleted') {
        throw new ApiError(404, 'User not found');
    }

    if (user.role === ROLES.ADMIN) {
        throw new ApiError(403, 'Admin accounts cannot be blocked');
    }

    if (blocked) {
        user.isActive = false;
        user.accountStatus = 'suspended';
        await user.save();

        await invalidateUserSessions(user._id);
    } else {
        user.isActive = true;
        user.accountStatus = 'active';
        await user.save();
    }

    return res.status(200).json({
        success: true,
        message: blocked ? 'User blocked successfully' : 'User unblocked successfully',
        data: formatAdminUserRow(user),
    });
};

const updateUserVerification = async (req, res) => {
    const { id } = req.params;
    const { emailVerified, phoneVerified } = req.body;

    const user = await User.findById(id).select('+refreshTokenExpires');

    if (!user || user.accountStatus === 'deleted') {
        throw new ApiError(404, 'User not found');
    }

    if (emailVerified !== undefined) {
        user.isEmailVerified = emailVerified;
    }

    if (phoneVerified !== undefined) {
        user.isPhoneVerified = phoneVerified;
    }

    await user.save();

    return res.status(200).json({
        success: true,
        message: 'User verification updated successfully',
        data: formatAdminUserRow(user),
    });
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (user) {
        if (user.authProvider === 'google') {
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a reset link has been sent',
            });
        }

        const { token, hashedToken } = generateResetToken();

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + Number(process.env.RESET_PASSWORD_EXPIRY_MS || 900000));
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        const expiryMinutes = Math.round(Number(process.env.RESET_PASSWORD_EXPIRY_MS || 900000) / 60000);
        const settings = await getStoreSettings();
        const resetEmail = await buildPasswordResetEmail({
            storeName: settings.storeName,
            resetUrl,
            expiryMinutes,
        });

        sendEmailSafe({
            to: email,
            subject: resetEmail.subject,
            html: resetEmail.html,
        });

        if (process.env.DEBUG_RESET_TOKEN === 'true') {
            console.log(`[DEBUG] Password reset link for ${email}: ${resetUrl}`);
        }
    }

    return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent',
    });
};

const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    const hashedToken = hashResetToken(token);
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
        throw new ApiError(400, 'Reset token is invalid or has expired');
    }

    if (user.authProvider === 'google') {
        throw new ApiError(400, 'This account uses Google sign-in. Password reset is not available.');
    }

    user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await User.findByIdAndUpdate(user._id, {
        $unset: { refreshToken: 1, refreshTokenExpires: 1, previousRefreshToken: 1 },
        $inc: { tokenVersion: 1 },
    });

    clearAuthCookies(res);

    return res.status(200).json({
        success: true,
        message: 'Password reset successfully',
    });
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (req.user.authProvider !== 'local') {
        throw new ApiError(400, 'Password change is not available for social login accounts');
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user?.password) {
        throw new ApiError(400, 'Password change is not available for this account');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
        throw new ApiError(401, 'Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await user.save();
    await invalidateUserSessions(user._id);

    return res.status(200).json({
        success: true,
        message: 'Password changed successfully. Please sign in again.',
    });
};

const verifyEmail = async (req, res) => {
    const token = req.query.token?.trim();

    if (!token) {
        throw new ApiError(400, 'Verification token is required');
    }

    const hashedToken = hashResetToken(token);
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
        throw new ApiError(400, 'Verification link is invalid or has expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
        success: true,
        message: 'Email verified successfully',
    });
};

const resendVerificationEmail = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (user.isEmailVerified) {
        return res.status(200).json({
            success: true,
            message: 'Email is already verified',
        });
    }

    await sendEmailVerificationMessage(user);

    return res.status(200).json({
        success: true,
        message: 'Verification email sent',
    });
};

const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (String(id) === String(req.user._id)) {
        throw new ApiError(400, 'You cannot change your own role');
    }

    const user = await User.findById(id).select('+refreshTokenExpires');

    if (!user || user.accountStatus === 'deleted') {
        throw new ApiError(404, 'User not found');
    }

    if (user.role === ROLES.ADMIN && role !== ROLES.ADMIN) {
        throw new ApiError(400, 'Admin role cannot be changed from this screen');
    }

    user.role = role;
    await user.save();
    await invalidateUserSessions(user._id);

    return res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: formatAdminUserRow(user),
    });
};

module.exports = {
    signup,
    login,
    refresh,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    getUsers,
    getUserById,
    updateUserStatus,
    updateUserVerification,
    updateUserRole,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
};
