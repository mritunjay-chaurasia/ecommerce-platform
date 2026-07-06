const getScheduledEntityStatus = ({
    isActive,
    startsAt,
    expiresAt,
    usageLimit,
    usedCount,
}, now = new Date()) => {
    if (!isActive) {
        return 'inactive';
    }

    if (startsAt && new Date(startsAt) > now) {
        return 'scheduled';
    }

    if (expiresAt && new Date(expiresAt) < now) {
        return 'expired';
    }

    if (usageLimit !== null && usageLimit !== undefined && usedCount >= usageLimit) {
        return 'exhausted';
    }

    return 'active';
};

const getBannerStatus = (banner, now = new Date()) => getScheduledEntityStatus({
    isActive: banner.isActive,
    startsAt: banner.startsAt,
    expiresAt: banner.expiresAt,
    usageLimit: null,
    usedCount: 0,
}, now);

const getCouponStatus = (coupon, now = new Date()) => getScheduledEntityStatus({
    isActive: coupon.isActive,
    startsAt: coupon.startsAt,
    expiresAt: coupon.expiresAt,
    usageLimit: coupon.usageLimit,
    usedCount: coupon.usedCount ?? 0,
}, now);

module.exports = {
    getScheduledEntityStatus,
    getBannerStatus,
    getCouponStatus,
};
