const WishlistItem = require('../models/wishlist.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const { getEffectivePrice } = require('../../../shared/utils/pricing');

const formatWishlistItem = (entry, product) => ({
    productId: String(product._id),
    name: product.name,
    categoryName: product.category?.name || '',
    imageUrl: product.imageUrls?.[0] || '',
    price: getEffectivePrice(product),
    originalPrice: product.price,
    stockQuantity: product.stockQuantity ?? 0,
    addedAt: entry.createdAt,
});

const fetchWishlistItems = async (userId) => {
    const entries = await WishlistItem.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate({
            path: 'product',
            populate: { path: 'category', select: 'name slug' },
        })
        .lean();

    const staleEntryIds = [];

    const items = entries.reduce((accumulator, entry) => {
        if (!entry.product || !entry.product.isActive) {
            staleEntryIds.push(entry._id);
            return accumulator;
        }

        accumulator.push(formatWishlistItem(entry, entry.product));
        return accumulator;
    }, []);

    if (staleEntryIds.length > 0) {
        await WishlistItem.deleteMany({ _id: { $in: staleEntryIds } });
    }

    return items;
};

const getMyWishlist = async (req, res) => {
    const items = await fetchWishlistItems(req.user._id);

    return res.status(200).json({
        success: true,
        data: items,
    });
};

const addToWishlist = async (req, res) => {
    const { productId } = req.body;

    const product = await Product.findOne({ _id: productId, isActive: true }).select('_id');

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    const existing = await WishlistItem.findOne({
        user: req.user._id,
        product: productId,
    }).select('_id');

    if (existing) {
        throw new ApiError(409, 'Product is already in your wishlist');
    }

    await WishlistItem.create({
        user: req.user._id,
        product: productId,
    });

    const items = await fetchWishlistItems(req.user._id);

    return res.status(201).json({
        success: true,
        message: 'Added to wishlist',
        data: items,
    });
};

const toggleWishlistItem = async (req, res) => {
    const { productId } = req.body;

    const product = await Product.findOne({ _id: productId, isActive: true }).select('_id');

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    const existing = await WishlistItem.findOne({
        user: req.user._id,
        product: productId,
    });

    let added = false;

    if (existing) {
        await existing.deleteOne();
    } else {
        await WishlistItem.create({
            user: req.user._id,
            product: productId,
        });
        added = true;
    }

    const items = await fetchWishlistItems(req.user._id);

    return res.status(200).json({
        success: true,
        message: added ? 'Added to wishlist' : 'Removed from wishlist',
        data: items,
        added,
    });
};

const removeFromWishlist = async (req, res) => {
    const { productId } = req.params;

    const deleted = await WishlistItem.findOneAndDelete({
        user: req.user._id,
        product: productId,
    });

    if (!deleted) {
        throw new ApiError(404, 'Wishlist item not found');
    }

    const items = await fetchWishlistItems(req.user._id);

    return res.status(200).json({
        success: true,
        message: 'Removed from wishlist',
        data: items,
    });
};

module.exports = {
    getMyWishlist,
    addToWishlist,
    toggleWishlistItem,
    removeFromWishlist,
};
