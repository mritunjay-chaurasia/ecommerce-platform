const { ORDER_STATUS } = require('../../../shared/constants/order');
const { Order } = require('../models/order.model');

const hasUserPurchasedProduct = async (userId, productId) => Order.exists({
    'customer.user': userId,
    orderStatus: ORDER_STATUS.DELIVERED,
    'items.product': productId,
});

module.exports = {
    hasUserPurchasedProduct,
};
