const { Coupon } = require('../models/coupon.model');
const ApiError = require('../utils/ApiError');
const escapeRegex = require('../utils/escapeRegex');
const { validateCouponBusinessRules, getCouponStatus } = require('../utils/coupon');

const normalizeCouponPayload = (payload = {}) => ({
    ...payload,
    code: payload.code !== undefined ? payload.code.trim().toUpperCase() : undefined,
    description: payload.description !== undefined ? payload.description.trim() : undefined,
});

const formatCoupon = (coupon, now = new Date()) => ({
    id: coupon._id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minOrderAmount: coupon.minOrderAmount,
    maxDiscountAmount: coupon.maxDiscountAmount,
    usageLimit: coupon.usageLimit,
    usedCount: coupon.usedCount,
    startsAt: coupon.startsAt,
    expiresAt: coupon.expiresAt,
    isActive: coupon.isActive,
    status: getCouponStatus(coupon, now),
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
});

const getCoupons = async (req, res) => {
    const page = req.query.page;
    const limit = req.query.limit;
    const search = req.query.search?.trim();
    const statusFilter = req.query.status?.trim();

    const filter = {};

    if (search) {
        const safeSearch = escapeRegex(search);
        filter.$or = [
            { code: { $regex: safeSearch, $options: 'i' } },
            { description: { $regex: safeSearch, $options: 'i' } },
        ];
    }

    const coupons = await Coupon.find(filter)
        .sort({ createdAt: -1 })
        .lean();

    const now = new Date();
    const formattedCoupons = coupons.map((coupon) => formatCoupon(coupon, now));
    const filteredCoupons = statusFilter
        ? formattedCoupons.filter((coupon) => coupon.status === statusFilter)
        : formattedCoupons;

    const total = filteredCoupons.length;
    const skip = (page - 1) * limit;
    const data = filteredCoupons.slice(skip, skip + limit);

    return res.status(200).json({
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
};

const createCoupon = async (req, res) => {
    const payload = normalizeCouponPayload(req.body);

    validateCouponBusinessRules(payload);

    const existingCoupon = await Coupon.findOne({
        code: { $regex: new RegExp(`^${escapeRegex(payload.code)}$`, 'i') },
    }).select('_id');

    if (existingCoupon) {
        throw new ApiError(409, 'Coupon code already exists');
    }

    const coupon = await Coupon.create(payload);

    return res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: formatCoupon(coupon),
    });
};

const updateCoupon = async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        throw new ApiError(404, 'Coupon not found');
    }

    const payload = normalizeCouponPayload(req.body);
    const nextCode = payload.code !== undefined ? payload.code : coupon.code;
    const mergedCoupon = {
        code: nextCode,
        description: payload.description !== undefined ? payload.description : coupon.description,
        discountType: payload.discountType !== undefined ? payload.discountType : coupon.discountType,
        discountValue: payload.discountValue !== undefined ? payload.discountValue : coupon.discountValue,
        minOrderAmount: payload.minOrderAmount !== undefined ? payload.minOrderAmount : coupon.minOrderAmount,
        maxDiscountAmount: payload.maxDiscountAmount !== undefined ? payload.maxDiscountAmount : coupon.maxDiscountAmount,
        usageLimit: payload.usageLimit !== undefined ? payload.usageLimit : coupon.usageLimit,
        startsAt: payload.startsAt !== undefined ? payload.startsAt : coupon.startsAt,
        expiresAt: payload.expiresAt !== undefined ? payload.expiresAt : coupon.expiresAt,
        isActive: payload.isActive !== undefined ? payload.isActive : coupon.isActive,
    };

    validateCouponBusinessRules(mergedCoupon, { usedCount: coupon.usedCount });

    if (nextCode !== coupon.code) {
        const existingCoupon = await Coupon.findOne({
            _id: { $ne: req.params.id },
            code: { $regex: new RegExp(`^${escapeRegex(nextCode)}$`, 'i') },
        }).select('_id');

        if (existingCoupon) {
            throw new ApiError(409, 'Coupon code already exists');
        }

        coupon.code = nextCode;
    }

    if (payload.description !== undefined) {
        coupon.description = payload.description;
    }

    if (payload.discountType !== undefined) {
        coupon.discountType = payload.discountType;
    }

    if (payload.discountValue !== undefined) {
        coupon.discountValue = payload.discountValue;
    }

    if (payload.minOrderAmount !== undefined) {
        coupon.minOrderAmount = payload.minOrderAmount;
    }

    if (payload.maxDiscountAmount !== undefined) {
        coupon.maxDiscountAmount = payload.maxDiscountAmount;
    }

    if (payload.usageLimit !== undefined) {
        coupon.usageLimit = payload.usageLimit;
    }

    if (payload.startsAt !== undefined) {
        coupon.startsAt = payload.startsAt;
    }

    if (payload.expiresAt !== undefined) {
        coupon.expiresAt = payload.expiresAt;
    }

    if (payload.isActive !== undefined) {
        coupon.isActive = payload.isActive;
    }

    await coupon.save();

    return res.status(200).json({
        success: true,
        message: 'Coupon updated successfully',
        data: formatCoupon(coupon),
    });
};

const deleteCoupon = async (req, res) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
        throw new ApiError(404, 'Coupon not found');
    }

    return res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully',
    });
};

module.exports = {
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
};
