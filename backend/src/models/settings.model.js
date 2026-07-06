const mongoose = require('mongoose');
const { CURRENCY_VALUES } = require('../constants/index');

const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        default: 'store',
    },
    storeName: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 80,
        default: 'ShopKart',
    },
    contactEmail: {
        type: String,
        trim: true,
        maxlength: 120,
        default: '',
    },
    contactPhone: {
        type: String,
        trim: true,
        maxlength: 20,
        default: '',
    },
    supportAddress: {
        type: String,
        trim: true,
        maxlength: 300,
        default: '',
    },
    currency: {
        type: String,
        enum: CURRENCY_VALUES,
        default: 'INR',
    },
    taxRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    freeShippingThreshold: {
        type: Number,
        min: 0,
        default: 2000,
    },
    standardShippingFee: {
        type: Number,
        min: 0,
        default: 99,
    },
    returnPolicy: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: '',
    },
}, {
    timestamps: true,
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = {
    Settings,
    CURRENCY_VALUES,
};
