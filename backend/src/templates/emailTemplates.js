const path = require('path');
const ejs = require('ejs');
const formatStatusLabel = require('../../../shared/utils/formatStatusLabel');
const { formatMoney } = require('../utils/currency');

const EMAIL_VIEWS_DIR = path.join(__dirname, '../templates/emails');

const renderEmailTemplate = (templateName, data) => ejs.renderFile(
    path.join(EMAIL_VIEWS_DIR, `${templateName}.ejs`),
    {
        formatMoney,
        formatStatusLabel,
        ...data,
    },
    {
        views: [EMAIL_VIEWS_DIR],
    },
);

const buildPasswordResetEmail = async ({ storeName, resetUrl, expiryMinutes }) => ({
    subject: `Reset your ${storeName} password`,
    html: await renderEmailTemplate('password-reset', {
        storeName,
        resetUrl,
        expiryMinutes,
    }),
});

const buildOrderConfirmationEmail = async ({ storeName, order, currency, orderUrl }) => ({
    subject: `Order confirmed — ${order.orderNumber}`,
    html: await renderEmailTemplate('order-confirmation', {
        storeName,
        order,
        currency,
        orderUrl,
        customerName: order.customer?.name || 'there',
    }),
});

const buildOrderStatusUpdateEmail = async ({
    storeName,
    order,
    orderUrl,
    previousOrderStatus,
    previousPaymentStatus,
}) => {
    const statusChanged = previousOrderStatus !== order.orderStatus;
    const paymentChanged = previousPaymentStatus !== order.paymentStatus;

    const messageParts = [];

    if (statusChanged) {
        messageParts.push(`Order status is now <strong>${formatStatusLabel(order.orderStatus)}</strong>.`);
    }

    if (paymentChanged) {
        messageParts.push(`Payment status is now <strong>${formatStatusLabel(order.paymentStatus)}</strong>.`);
    }

    return {
        subject: `Order ${order.orderNumber} updated`,
        html: await renderEmailTemplate('order-status-update', {
            storeName,
            order,
            orderUrl,
            statusMessage: messageParts.join(' '),
        }),
    };
};

const buildOrderCancellationEmail = async ({ storeName, order, orderUrl }) => ({
    subject: `Order cancelled — ${order.orderNumber}`,
    html: await renderEmailTemplate('order-cancellation', {
        storeName,
        order,
        orderUrl,
    }),
});

module.exports = {
    renderEmailTemplate,
    buildPasswordResetEmail,
    buildOrderConfirmationEmail,
    buildOrderStatusUpdateEmail,
    buildOrderCancellationEmail,
};
