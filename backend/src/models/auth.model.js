const mongoose = require('mongoose');
const { ROLE_VALUES, ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        select: false,
        required: function () {
            return this.authProvider === 'local';
        },
    },
    phone: {
        type: String,
        trim: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', null],
        default: null,
    },
    role: {
        type: String,
        enum: ROLE_VALUES,
        default: ROLES.CUSTOMER,
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
    },
    googleId: {
        type: String,
    },
    avatar: {
        type: String,
        default: null,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    accountStatus: {
        type: String,
        enum: ['active', 'suspended', 'deleted'],
        default: 'active',
    },
    lastLoginAt: {
        type: Date,
        default: null,
    },
    emailVerificationToken: {
        type: String,
        select: false,
    },
    emailVerificationExpires: {
        type: Date,
        select: false,
    },
    phoneOtp: {
        type: String,
        select: false,
    },
    phoneOtpExpires: {
        type: Date,
        select: false,
    },
    resetPasswordToken: {
        type: String,
        select: false,
    },
    resetPasswordExpires: {
        type: Date,
        select: false,
    },
    refreshToken: {
        type: String,
        select: false,
    },
    refreshTokenExpires: {
        type: Date,
        select: false,
    },
    previousRefreshToken: {
        type: String,
        select: false,
    },
    tokenVersion: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index(
    { googleId: 1 },
    {
        unique: true,
        partialFilterExpression: { googleId: { $exists: true, $type: 'string' } },
    },
);

const User = mongoose.model('User', userSchema);

module.exports = User;
