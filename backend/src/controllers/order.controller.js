const { Order } = require('../models/order.model');
const ApiError = require('../utils/ApiError');
const escapeRegex = require('../utils/escapeRegex');
const { formatAdminOrder } = require('../utils/formatters/order');
const { notifyOrderStatusUpdate } = require('../templates/orderEmails');
const { getStoreSettings } = require('../utils/storeSettings');
const { renderInvoiceHtml } = require('../utils/renderInvoice');

const buildOrderFilter = ({ search, orderStatus, paymentStatus }) => {
    const filter = {};

    if (orderStatus) {
        filter.orderStatus = orderStatus;
    }

    if (paymentStatus) {
        filter.paymentStatus = paymentStatus;
    }

    if (search) {
        const safeSearch = escapeRegex(search);
        filter.$or = [
            { orderNumber: { $regex: safeSearch, $options: 'i' } },
            { 'customer.name': { $regex: safeSearch, $options: 'i' } },
            { 'customer.email': { $regex: safeSearch, $options: 'i' } },
            { 'customer.phone': { $regex: safeSearch, $options: 'i' } },
        ];
    }

    return filter;
};

const getOrders = async (req, res) => {
    const page = req.query.page;
    const limit = req.query.limit;
    const filter = buildOrderFilter(req.query);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .sort({ placedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Order.countDocuments(filter),
    ]);

    return res.status(200).json({
        success: true,
        data: orders.map(formatAdminOrder),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
};

const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    return res.status(200).json({
        success: true,
        data: formatAdminOrder(order),
    });
};

const updateOrderStatus = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    const previousOrderStatus = order.orderStatus;
    const previousPaymentStatus = order.paymentStatus;

    if (req.body.orderStatus !== undefined) {
        order.orderStatus = req.body.orderStatus;
    }

    if (req.body.paymentStatus !== undefined) {
        order.paymentStatus = req.body.paymentStatus;
    }

    if (req.body.trackingNumber !== undefined) {
        order.trackingNumber = req.body.trackingNumber.trim();
    }

    if (req.body.notes !== undefined) {
        order.notes = req.body.notes.trim();
    }

    await order.save();

    notifyOrderStatusUpdate(order, { previousOrderStatus, previousPaymentStatus });

    return res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        data: formatAdminOrder(order.toObject()),
    });
};

const getAdminOrderInvoice = async (req, res) => {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    const settings = await getStoreSettings();
    const html = await renderInvoiceHtml({
        storeName: settings.storeName,
        currency: settings.currency,
        order,
        issuedAt: new Date(order.placedAt || order.createdAt).toLocaleString('en-IN'),
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
};

module.exports = {
    getOrders,
    getOrderById,
    updateOrderStatus,
    getAdminOrderInvoice,
};
