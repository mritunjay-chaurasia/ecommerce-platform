const mongoose = require('mongoose');

const DISCOUNT_TYPE_VALUES = ['percentage', 'fixed'];
const COUPON_CODE_REGEX = /^[A-Z0-9_-]+$/;

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        unique: true,
        minlength: 3,
        maxlength: 40,
        match: COUPON_CODE_REGEX,
    },
    description: {
        type: String,
        trim: true,
        default: '',
        maxlength: 300,
    },
    discountType: {
        type: String,
        enum: DISCOUNT_TYPE_VALUES,
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0,
    },
    minOrderAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    maxDiscountAmount: {
        type: Number,
        default: null,
        min: 0,
    },
    usageLimit: {
        type: Number,
        default: null,
        min: 1,
    },
    usedCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    startsAt: {
        type: Date,
        default: null,
    },
    expiresAt: {
        type: Date,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1, startsAt: 1, expiresAt: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = {
    Coupon,
    DISCOUNT_TYPE_VALUES,
};
