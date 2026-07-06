const mongoose = require('mongoose');

const REVIEW_STATUS_VALUES = ['pending', 'approved', 'hidden', 'rejected'];

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    title: {
        type: String,
        trim: true,
        maxlength: 120,
        default: '',
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },
    status: {
        type: String,
        enum: REVIEW_STATUS_VALUES,
        default: 'pending',
    },
}, {
    timestamps: true,
});

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = {
    Review,
    REVIEW_STATUS_VALUES,
};
