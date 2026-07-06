const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    label: {
        type: String,
        trim: true,
        maxlength: 40,
        default: 'Home',
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        maxlength: 15,
    },
    line1: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },
    line2: {
        type: String,
        trim: true,
        maxlength: 120,
        default: '',
    },
    city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
    },
    state: {
        type: String,
        trim: true,
        maxlength: 80,
        default: '',
    },
    postalCode: {
        type: String,
        trim: true,
        maxlength: 20,
        default: '',
    },
    country: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

addressSchema.index({ user: 1, isDefault: 1 });

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
