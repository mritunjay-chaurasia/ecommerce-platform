const { Review } = require('../models/review.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const escapeRegex = require('../utils/escapeRegex');
const { hasUserPurchasedProduct } = require('../utils/orderVerification');

const formatReview = (review) => ({
    id: review._id,
    productId: review.product?._id ? String(review.product._id) : String(review.product),
    productName: review.product?.name || '',
    userId: review.user?._id ? String(review.user._id) : String(review.user),
    customerName: review.user
        ? `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim()
        : '',
    customerEmail: review.user?.email || '',
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    status: review.status,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
});

const formatPublicReview = (review) => ({
    id: String(review._id),
    productId: String(review.product?._id || review.product),
    customerName: review.user
        ? `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim()
        : 'Customer',
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    createdAt: review.createdAt,
});

const buildReviewFilter = (query) => {
    const filter = {};
    const search = query.search?.trim();
    const status = query.status?.trim();
    const productId = query.productId?.trim();

    if (status) {
        filter.status = status;
    }

    if (productId) {
        filter.product = productId;
    }

    if (search) {
        const safeSearch = escapeRegex(search);
        filter.$or = [
            { title: { $regex: safeSearch, $options: 'i' } },
            { comment: { $regex: safeSearch, $options: 'i' } },
        ];
    }

    return filter;
};

const getAdminReviews = async (req, res) => {
    const page = req.query.page;
    const limit = req.query.limit;
    const filter = buildReviewFilter(req.query);

    const [reviews, total] = await Promise.all([
        Review.find(filter)
            .populate('product', 'name slug')
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Review.countDocuments(filter),
    ]);

    return res.status(200).json({
        success: true,
        data: reviews.map(formatReview),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        },
    });
};

const updateReviewStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const review = await Review.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true },
    )
        .populate('product', 'name slug')
        .populate('user', 'firstName lastName email');

    if (!review) {
        throw new ApiError(404, 'Review not found');
    }

    return res.status(200).json({
        success: true,
        message: 'Review status updated successfully',
        data: formatReview(review),
    });
};

const deleteReview = async (req, res) => {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
        throw new ApiError(404, 'Review not found');
    }

    return res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
    });
};

const createCustomerReview = async (req, res) => {
    const { productId, rating, title, comment } = req.body;

    const product = await Product.findOne({ _id: productId, isActive: true }).select('_id name');

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    const existingReview = await Review.findOne({
        product: productId,
        user: req.user._id,
    }).select('_id');

    if (existingReview) {
        throw new ApiError(409, 'You have already reviewed this product');
    }

    const hasDeliveredPurchase = await hasUserPurchasedProduct(req.user._id, productId);

    if (!hasDeliveredPurchase) {
        throw new ApiError(403, 'You can review this product only after it has been delivered to you');
    }

    const review = await Review.create({
        product: productId,
        user: req.user._id,
        rating,
        title: title?.trim() || '',
        comment: comment.trim(),
        status: 'pending',
    });

    await review.populate([
        { path: 'product', select: 'name slug' },
        { path: 'user', select: 'firstName lastName email' },
    ]);

    return res.status(201).json({
        success: true,
        message: 'Review submitted successfully and is pending approval',
        data: formatReview(review),
    });
};

const getProductReviews = async (req, res) => {
    const { productId } = req.params;

    const reviews = await Review.find({
        product: productId,
        status: 'approved',
    })
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        data: reviews.map(formatPublicReview),
    });
};

const getMyProductReview = async (req, res) => {
    const { productId } = req.query;

    const review = await Review.findOne({
        product: productId,
        user: req.user._id,
    })
        .select('rating title comment status createdAt')
        .lean();

    return res.status(200).json({
        success: true,
        data: review ? {
            id: String(review._id),
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            status: review.status,
            createdAt: review.createdAt,
        } : null,
    });
};

module.exports = {
    getAdminReviews,
    updateReviewStatus,
    deleteReview,
    createCustomerReview,
    getProductReviews,
    getMyProductReview,
};
