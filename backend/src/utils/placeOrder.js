const { Coupon } = require('../models/coupon.model');
const { Order } = require('../models/order.model');
const Product = require('../models/product.model');
const { buildCheckoutSummary } = require('./checkout');
const { ORDER_STATUS } = require('../../../shared/constants/order');

const placeOrder = async ({ body, user }) => {
    const summary = await buildCheckoutSummary(body);
    const couponCode = body.couponCode?.trim().toUpperCase();
    const shippingAddress = body.shippingAddress;

    const order = await Order.create({
        customer: {
            user: user._id,
            name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.email,
            phone: shippingAddress.phone || user.phone || '',
        },
        items: summary.items.map((item) => ({
            product: item.productId,
            productName: item.name,
            sku: item.sku,
            imageUrl: item.imageUrl,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
        })),
        shippingAddress,
        subtotal: summary.subtotal,
        shippingFee: summary.shippingFee,
        taxAmount: summary.taxAmount,
        discountAmount: summary.discountAmount,
        totalAmount: summary.totalAmount,
        paymentMethod: body.paymentMethod || 'cod',
        paymentStatus: 'pending',
        orderStatus: ORDER_STATUS.PENDING,
        notes: body.notes || '',
        placedAt: new Date(),
    });

    for (const item of body.items) {
        await Product.updateOne(
            { _id: item.productId },
            { $inc: { stockQuantity: -item.quantity } },
        );
    }

    if (couponCode) {
        await Coupon.updateOne({ code: couponCode }, { $inc: { usedCount: 1 } });
    }

    return order;
};

module.exports = {
    placeOrder,
};
