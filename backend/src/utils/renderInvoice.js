const path = require('path');
const ejs = require('ejs');
const formatStatusLabel = require('../../../shared/utils/formatStatusLabel');
const { formatMoney } = require('../utils/currency');

const INVOICE_VIEWS_DIR = path.join(__dirname, '../templates/invoices');

const renderInvoiceHtml = (data) => ejs.renderFile(
    path.join(INVOICE_VIEWS_DIR, 'order-invoice.ejs'),
    {
        formatMoney,
        formatStatusLabel,
        ...data,
    },
    {
        views: [INVOICE_VIEWS_DIR],
    },
);

module.exports = {
    renderInvoiceHtml,
};
