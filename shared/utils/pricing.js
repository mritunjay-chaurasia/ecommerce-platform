const getEffectivePrice = (productOrPrice, salePrice) => {
    if (typeof productOrPrice === 'object' && productOrPrice !== null) {
        return productOrPrice.salePrice ?? productOrPrice.price ?? 0;
    }

    if (salePrice !== undefined && salePrice !== null) {
        return salePrice;
    }

    return Number(productOrPrice || 0);
};

const calculateShippingFee = (subtotal, settings) => (
    subtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee
);

const calculateTaxAmount = (subtotal, taxRate) => (
    Number(((subtotal * taxRate) / 100).toFixed(2))
);

const calculateDiscountAmount = (coupon, subtotal) => {
    if (!coupon) {
        return 0;
    }

    let discountAmount = coupon.discountType === 'percentage'
        ? (subtotal * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount !== undefined) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }

    return Math.min(discountAmount, subtotal);
};

const calculateOrderTotal = (subtotal, shippingFee, taxAmount, discountAmount) => (
    Math.max(subtotal + shippingFee + taxAmount - discountAmount, 0)
);

module.exports = {
    getEffectivePrice,
    calculateShippingFee,
    calculateTaxAmount,
    calculateDiscountAmount,
    calculateOrderTotal,
};
