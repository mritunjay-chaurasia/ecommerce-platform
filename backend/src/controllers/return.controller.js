const { ReturnRequest } = require('../models/returnRequest.model');
const { Order } = require('../models/order.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const escapeRegex = require('../utils/escapeRegex');
const { RETURNABLE_ORDER_STATUSES, ORDER_STATUS } = require('../../../shared/constants/order');
const { RETURN_REQUEST_STATUS } = require('../../../shared/constants/return');
const { buildPagination, parsePaginationQuery } = require('../utils/pagination');
const { sendEmailSafe } = require('../utils/sendEmail');
const { buildReturnStatusUpdateEmail } = require('../templates/emailTemplates');
const { getStoreSettings } = require('../utils/storeSettings');
const formatStatusLabel = require('../../../shared/utils/formatStatusLabel');

const formatReturnRequest = (request) => ({
    id: String(request._id),
    orderId: String(request.order),
    orderNumber: request.orderNumber,
    customerEmail: request.customerEmail,
    reason: request.reason,
    status: request.status,
    adminNotes: request.adminNotes,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
});

const createReturnRequest = async (req, res) => {
    const { orderId } = req.params;
    const user = req.user;

    const order = await Order.findOne({
        _id: orderId,
        'customer.user': user._id,
    });

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    if (!RETURNABLE_ORDER_STATUSES.includes(order.orderStatus)) {
        throw new ApiError(400, 'Returns can only be requested for delivered orders');
    }

    const existingRequest = await ReturnRequest.findOne({ order: order._id });

    if (existingRequest) {
        throw new ApiError(409, 'A return request already exists for this order');
    }

    const returnRequest = await ReturnRequest.create({
        order: order._id,
        user: user._id,
        orderNumber: order.orderNumber,
        customerEmail: order.customer.email,
        reason: req.body.reason.trim(),
        status: RETURN_REQUEST_STATUS.PENDING,
    });

    order.notes = [order.notes, `Return requested: ${req.body.reason.trim()}`]
        .filter(Boolean)
        .join('\n');
    await order.save();

    return res.status(201).json({
        success: true,
        message: 'Return request submitted successfully',
        data: formatReturnRequest(returnRequest.toObject()),
    });
};

const getMyReturnRequests = async (req, res) => {
    const requests = await ReturnRequest.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        data: requests.map(formatReturnRequest),
    });
};

const getAdminReturnRequests = async (req, res) => {
    const { page, limit, skip } = parsePaginationQuery(req.query);
    const filter = {};

    if (req.query.status) {
        filter.status = req.query.status;
    }

    if (req.query.search) {
        const safeSearch = escapeRegex(req.query.search);
        filter.$or = [
            { orderNumber: { $regex: safeSearch, $options: 'i' } },
            { customerEmail: { $regex: safeSearch, $options: 'i' } },
            { reason: { $regex: safeSearch, $options: 'i' } },
        ];
    }

    const [requests, total] = await Promise.all([
        ReturnRequest.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        ReturnRequest.countDocuments(filter),
    ]);

    return res.status(200).json({
        success: true,
        data: requests.map(formatReturnRequest),
        pagination: buildPagination(page, limit, total),
    });
};

const updateReturnRequestStatus = async (req, res) => {
    const returnRequest = await ReturnRequest.findById(req.params.id);

    if (!returnRequest) {
        throw new ApiError(404, 'Return request not found');
    }

    const nextStatus = req.body.status;
    const adminNotes = req.body.adminNotes?.trim() || '';

    if (returnRequest.status === RETURN_REQUEST_STATUS.COMPLETED) {
        throw new ApiError(400, 'This return request is already completed');
    }

    if (nextStatus === RETURN_REQUEST_STATUS.APPROVED || nextStatus === RETURN_REQUEST_STATUS.COMPLETED) {
        const order = await Order.findById(returnRequest.order);

        if (!order) {
            throw new ApiError(404, 'Associated order not found');
        }

        if (order.orderStatus !== ORDER_STATUS.RETURNED) {
            for (const item of order.items) {
                if (item.product) {
                    await Product.updateOne(
                        { _id: item.product },
                        { $inc: { stockQuantity: item.quantity } },
                    );
                }
            }

            order.orderStatus = ORDER_STATUS.RETURNED;
            order.paymentStatus = 'refunded';
            order.notes = [order.notes, `Return approved${adminNotes ? `: ${adminNotes}` : ''}`]
                .filter(Boolean)
                .join('\n');
            await order.save();
        }

        returnRequest.status = RETURN_REQUEST_STATUS.COMPLETED;
    } else {
        returnRequest.status = nextStatus;
    }

    if (adminNotes) {
        returnRequest.adminNotes = adminNotes;
    }

    await returnRequest.save();

    const settings = await getStoreSettings();
    const returnEmail = await buildReturnStatusUpdateEmail({
        storeName: settings.storeName,
        orderNumber: returnRequest.orderNumber,
        statusLabel: formatStatusLabel(returnRequest.status),
        adminNotes: returnRequest.adminNotes,
        supportEmail: settings.contactEmail,
    });

    sendEmailSafe({
        to: returnRequest.customerEmail,
        subject: returnEmail.subject,
        html: returnEmail.html,
    });

    return res.status(200).json({
        success: true,
        message: 'Return request updated successfully',
        data: formatReturnRequest(returnRequest.toObject()),
    });
};

module.exports = {
    createReturnRequest,
    getMyReturnRequests,
    getAdminReturnRequests,
    updateReturnRequestStatus,
};
