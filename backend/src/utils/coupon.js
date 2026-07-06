const { Coupon } = require('../models/coupon.model');
const ApiError = require('./ApiError');
const { getCouponStatus } = require('../../../shared/utils/temporalStatus');
const { calculateDiscountAmount } = require('../../../shared/utils/pricing');
const { formatMoney } = require('./currency');

const validateCouponBusinessRules = (coupon, options = {}) => {
    const { usedCount = 0 } = options;

    if (coupon.discountValue !== undefined && coupon.discountValue <= 0) {
        throw new ApiError(400, 'Discount value must be greater than 0');
    }

    if (coupon.discountType === 'percentage' && coupon.discountValue > 100) {
        throw new ApiError(400, 'Percentage discount cannot be greater than 100');
    }

    if (coupon.maxDiscountAmount !== undefined && coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount <= 0) {
        throw new ApiError(400, 'Maximum discount amount must be greater than 0 when provided');
    }

    if (
        coupon.startsAt
        && coupon.expiresAt
        && new Date(coupon.startsAt).getTime() > new Date(coupon.expiresAt).getTime()
    ) {
        throw new ApiError(400, 'Expiry date must be after the start date');
    }

    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usageLimit < usedCount) {
        throw new ApiError(400, 'Usage limit cannot be less than the number of times the coupon has already been used');
    }
};

const getCouponStatusMessage = (status) => {
    if (status === 'scheduled') {
        return 'This coupon is not active yet';
    }

    if (status === 'expired') {
        return 'This coupon has expired';
    }

    if (status === 'exhausted') {
        return 'This coupon has reached its usage limit';
    }

    return 'This coupon is inactive';
};

const resolveCoupon = async (couponCode, subtotal, currency = 'INR') => {
    if (!couponCode) {
        return {
            coupon: null,
            discountAmount: 0,
        };
    }

    const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() }).lean();

    if (!coupon) {
        throw new ApiError(400, 'Invalid coupon code');
    }

    const status = getCouponStatus(coupon);

    if (status !== 'active') {
        throw new ApiError(400, getCouponStatusMessage(status));
    }

    if (subtotal < coupon.minOrderAmount) {
        throw new ApiError(
            400,
            `Minimum order amount for this coupon is ${formatMoney(coupon.minOrderAmount, currency)}`,
        );
    }

    return {
        coupon,
        discountAmount: calculateDiscountAmount(coupon, subtotal),
    };
};

module.exports = {
    validateCouponBusinessRules,
    resolveCoupon,
    getCouponStatus,
};
