const { sendEmailSafe } = require('../utils/sendEmail');
const {
    buildOrderCancellationEmail,
    buildOrderConfirmationEmail,
    buildOrderStatusUpdateEmail,
} = require('./emailTemplates');
const { getStoreSettings } = require('../utils/storeSettings');

const getOrderUrl = (orderId) => `${process.env.FRONTEND_URL}/orders/${orderId}`;

const notifyOrderConfirmation = async (order) => {
    const settings = await getStoreSettings();
    const email = await buildOrderConfirmationEmail({
        storeName: settings.storeName,
        order,
        currency: settings.currency,
        orderUrl: getOrderUrl(order._id),
    });

    sendEmailSafe({
        to: order.customer.email,
        subject: email.subject,
        html: email.html,
    });
};

const notifyOrderStatusUpdate = async (order, { previousOrderStatus, previousPaymentStatus }) => {
    const statusChanged = previousOrderStatus !== order.orderStatus;
    const paymentChanged = previousPaymentStatus !== order.paymentStatus;

    if (!statusChanged && !paymentChanged) {
        return;
    }

    const settings = await getStoreSettings();
    const email = await buildOrderStatusUpdateEmail({
        storeName: settings.storeName,
        order,
        orderUrl: getOrderUrl(order._id),
        previousOrderStatus,
        previousPaymentStatus,
    });

    sendEmailSafe({
        to: order.customer.email,
        subject: email.subject,
        html: email.html,
    });
};

const notifyOrderCancellation = async (order) => {
    const settings = await getStoreSettings();
    const email = await buildOrderCancellationEmail({
        storeName: settings.storeName,
        order,
        orderUrl: getOrderUrl(order._id),
    });

    sendEmailSafe({
        to: order.customer.email,
        subject: email.subject,
        html: email.html,
    });
};

module.exports = {
    notifyOrderConfirmation,
    notifyOrderStatusUpdate,
    notifyOrderCancellation,
};
