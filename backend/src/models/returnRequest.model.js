const mongoose = require('mongoose');
const { RETURN_REQUEST_STATUS_VALUES } = require('../../../shared/constants/return');

const returnRequestSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderNumber: {
        type: String,
        required: true,
        trim: true,
    },
    customerEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },
    status: {
        type: String,
        enum: RETURN_REQUEST_STATUS_VALUES,
        default: 'pending',
    },
    adminNotes: {
        type: String,
        trim: true,
        default: '',
        maxlength: 1000,
    },
}, { timestamps: true });

returnRequestSchema.index({ order: 1 }, { unique: true });
returnRequestSchema.index({ status: 1, createdAt: -1 });
returnRequestSchema.index({ customerEmail: 1 });

const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);

module.exports = {
    ReturnRequest,
    RETURN_REQUEST_STATUS_VALUES,
};
