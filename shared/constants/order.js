const ORDER_STATUS_VALUES = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
];

const PAYMENT_STATUS_VALUES = [
    'pending',
    'paid',
    'failed',
    'refunded',
    'partially_refunded',
];

const PAYMENT_METHOD_VALUES = [
    'cod',
    'card',
    'upi',
    'wallet',
    'bank_transfer',
    'other',
];

const CUSTOMER_PAYMENT_METHOD_VALUES = ['cod', 'upi', 'card'];

const CANCELLABLE_ORDER_STATUSES = ['pending', 'confirmed'];
const RETURNABLE_ORDER_STATUSES = ['delivered'];
const PAID_PAYMENT_STATUSES = ['paid', 'partially_refunded'];
const PENDING_ORDER_STATUSES = ['pending', 'confirmed', 'processing'];

const ORDER_STATUS = Object.freeze({
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    RETURNED: 'returned',
});

const ORDER_STEPS = [
    { key: ORDER_STATUS.PENDING, label: 'Order Placed' },
    { key: ORDER_STATUS.CONFIRMED, label: 'Confirmed' },
    { key: ORDER_STATUS.PROCESSING, label: 'Processing' },
    { key: ORDER_STATUS.SHIPPED, label: 'Shipped' },
    { key: ORDER_STATUS.DELIVERED, label: 'Delivered' },
];

module.exports = {
    ORDER_STATUS_VALUES,
    PAYMENT_STATUS_VALUES,
    PAYMENT_METHOD_VALUES,
    CUSTOMER_PAYMENT_METHOD_VALUES,
    CANCELLABLE_ORDER_STATUSES,
    RETURNABLE_ORDER_STATUSES,
    PAID_PAYMENT_STATUSES,
    PENDING_ORDER_STATUSES,
    ORDER_STATUS,
    ORDER_STEPS,
};
