const mongoose = require('mongoose');
const {
    ORDER_STATUS_VALUES,
    PAYMENT_STATUS_VALUES,
    PAYMENT_METHOD_VALUES,
} = require('../../../shared/constants/order');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null,
    },
    productName: {
        type: String,
        required: true,
        trim: true,
    },
    sku: {
        type: String,
        trim: true,
        default: '',
    },
    imageUrl: {
        type: String,
        default: '',
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    lineTotal: {
        type: Number,
        required: true,
        min: 0,
    },
}, { _id: false });

const orderCustomerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
        default: '',
    },
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
        default: '',
    },
    line1: {
        type: String,
        required: true,
        trim: true,
    },
    line2: {
        type: String,
        trim: true,
        default: '',
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    state: {
        type: String,
        trim: true,
        default: '',
    },
    postalCode: {
        type: String,
        trim: true,
        default: '',
    },
    country: {
        type: String,
        required: true,
        trim: true,
    },
}, { _id: false });

const createOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${timestamp}${random}`;
};

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        default: createOrderNumber,
    },
    customer: {
        type: orderCustomerSchema,
        required: true,
    },
    items: {
        type: [orderItemSchema],
        validate: {
            validator: (items) => Array.isArray(items) && items.length > 0,
            message: 'At least one order item is required',
        },
        default: [],
    },
    shippingAddress: {
        type: shippingAddressSchema,
        required: true,
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0,
    },
    shippingFee: {
        type: Number,
        default: 0,
        min: 0,
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    paymentMethod: {
        type: String,
        enum: PAYMENT_METHOD_VALUES,
        default: 'cod',
    },
    paymentStatus: {
        type: String,
        enum: PAYMENT_STATUS_VALUES,
        default: 'pending',
    },
    orderStatus: {
        type: String,
        enum: ORDER_STATUS_VALUES,
        default: 'pending',
    },
    trackingNumber: {
        type: String,
        trim: true,
        default: '',
    },
    notes: {
        type: String,
        trim: true,
        default: '',
    },
    placedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

orderSchema.index({ orderStatus: 1, placedAt: -1 });
orderSchema.index({ paymentStatus: 1, placedAt: -1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ placedAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = {
    Order,
    ORDER_STATUS_VALUES,
    PAYMENT_STATUS_VALUES,
    PAYMENT_METHOD_VALUES,
};
