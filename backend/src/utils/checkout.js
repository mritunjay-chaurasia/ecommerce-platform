const Product = require('../models/product.model');
const ApiError = require('./ApiError');
const { getStoreSettings } = require('./storeSettings');
const { resolveCoupon } = require('./coupon');
const { getEffectivePrice, calculateShippingFee, calculateTaxAmount, calculateOrderTotal } = require('../../../shared/utils/pricing');

const normalizeCartItems = (items = []) => {
    const aggregated = new Map();

    items.forEach((item) => {
        const productId = String(item.productId);
        const currentQuantity = aggregated.get(productId) || 0;
        aggregated.set(productId, currentQuantity + item.quantity);
    });

    return Array.from(aggregated.entries()).map(([productId, quantity]) => ({
        productId,
        quantity,
    }));
};

const resolveCheckoutItems = async (items) => {
    const normalizedItems = normalizeCartItems(items);
    const productIds = normalizedItems.map((item) => item.productId);

    const products = await Product.find({
        _id: { $in: productIds },
        isActive: true,
    })
        .populate('category', 'name slug')
        .lean();

    if (products.length !== productIds.length) {
        throw new ApiError(400, 'One or more products are unavailable');
    }

    const productMap = new Map(products.map((product) => [String(product._id), product]));

    return normalizedItems.map((item) => {
        const product = productMap.get(item.productId);

        if (!product) {
            throw new ApiError(400, 'One or more products are unavailable');
        }

        if (product.stockQuantity < item.quantity) {
            throw new ApiError(400, `${product.name} has only ${product.stockQuantity} unit(s) left in stock`);
        }

        const unitPrice = getEffectivePrice(product);

        return {
            productId: item.productId,
            quantity: item.quantity,
            product,
            unitPrice,
            lineTotal: unitPrice * item.quantity,
        };
    });
};

const buildCheckoutSummary = async ({ items, couponCode }) => {
    const settings = await getStoreSettings();
    const resolvedItems = await resolveCheckoutItems(items);
    const subtotal = resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const shippingFee = calculateShippingFee(subtotal, settings);
    const taxAmount = calculateTaxAmount(subtotal, settings.taxRate);
    const { coupon, discountAmount } = await resolveCoupon(couponCode, subtotal, settings.currency);
    const totalAmount = calculateOrderTotal(subtotal, shippingFee, taxAmount, discountAmount);

    return {
        items: resolvedItems.map((item) => ({
            productId: item.productId,
            name: item.product.name,
            sku: item.product.sku,
            imageUrl: item.product.imageUrls?.[0] || '',
            categoryName: item.product.category?.name || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
        })),
        subtotal,
        shippingFee,
        taxAmount,
        discountAmount,
        totalAmount,
        coupon: coupon ? {
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            maxDiscountAmount: coupon.maxDiscountAmount,
        } : null,
        shippingRules: {
            freeShippingThreshold: settings.freeShippingThreshold,
            standardShippingFee: settings.standardShippingFee,
        },
        currency: settings.currency,
        taxRate: settings.taxRate,
    };
};

module.exports = {
    normalizeCartItems,
    resolveCheckoutItems,
    buildCheckoutSummary,
};
