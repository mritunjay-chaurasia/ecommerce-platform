const mongoose = require('mongoose');

const PLACEMENT_VALUES = ['hero', 'promo'];

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 120,
    },
    tag: {
        type: String,
        trim: true,
        maxlength: 60,
        default: '',
    },
    subtitle: {
        type: String,
        trim: true,
        maxlength: 300,
        default: '',
    },
    imageUrl: {
        type: String,
        trim: true,
        maxlength: 500,
        default: '',
    },
    buttonText: {
        type: String,
        trim: true,
        maxlength: 40,
        default: '',
    },
    placement: {
        type: String,
        enum: PLACEMENT_VALUES,
        default: 'hero',
    },
    sortOrder: {
        type: Number,
        default: 0,
        min: 0,
        max: 9999,
    },
    startsAt: {
        type: Date,
        default: null,
    },
    expiresAt: {
        type: Date,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

bannerSchema.index({ placement: 1, isActive: 1, sortOrder: 1, startsAt: 1, expiresAt: 1 });

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = {
    Banner,
    PLACEMENT_VALUES,
};
