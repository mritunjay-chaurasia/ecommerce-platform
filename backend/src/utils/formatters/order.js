const getOrderItemsCount = (items = []) => items.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
);

const formatOrderItemForCustomer = (item) => ({
    productId: item.product ? String(item.product) : null,
    productName: item.productName,
    sku: item.sku,
    imageUrl: item.imageUrl,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
});

const formatOrderItemForAdmin = (item) => ({
    product: item.product || null,
    productName: item.productName,
    sku: item.sku,
    imageUrl: item.imageUrl,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
});

const formatCustomerOrder = (order) => ({
    id: String(order._id),
    orderNumber: order.orderNumber,
    items: (order.items || []).map(formatOrderItemForCustomer),
    itemsCount: getOrderItemsCount(order.items),
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    taxAmount: order.taxAmount,
    discountAmount: order.discountAmount,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    trackingNumber: order.trackingNumber,
    notes: order.notes,
    shippingAddress: order.shippingAddress,
    placedAt: order.placedAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
});

const formatAdminOrder = (order) => {
    const items = order.items || [];

    return {
        id: order._id,
        orderNumber: order.orderNumber,
        customer: {
            id: order.customer?.user || null,
            name: order.customer?.name || '',
            email: order.customer?.email || '',
            phone: order.customer?.phone || '',
        },
        customerName: order.customer?.name || '',
        customerEmail: order.customer?.email || '',
        customerPhone: order.customer?.phone || '',
        items: items.map(formatOrderItemForAdmin),
        itemsCount: getOrderItemsCount(items),
        shippingAddress: order.shippingAddress,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        taxAmount: order.taxAmount,
        discountAmount: order.discountAmount,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        trackingNumber: order.trackingNumber,
        notes: order.notes,
        placedAt: order.placedAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
    };
};

const formatRecentOrder = (order) => ({
    id: order._id,
    orderNumber: order.orderNumber,
    customerName: order.customer?.name || '',
    customerEmail: order.customer?.email || '',
    itemsCount: getOrderItemsCount(order.items),
    totalAmount: order.totalAmount,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    placedAt: order.placedAt,
});

module.exports = {
    getOrderItemsCount,
    formatCustomerOrder,
    formatAdminOrder,
    formatRecentOrder,
};
