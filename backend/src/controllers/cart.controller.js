const CartItem = require('../models/cart.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const { getEffectivePrice } = require('../../../shared/utils/pricing');

const formatCartItem = (entry, product) => ({
    productId: String(product._id),
    name: product.name,
    categoryName: product.category?.name || '',
    imageUrl: product.imageUrls?.[0] || '',
    price: getEffectivePrice(product),
    originalPrice: product.price,
    stockQuantity: product.stockQuantity ?? 0,
    quantity: entry.quantity,
    addedAt: entry.createdAt,
});

const fetchCartItems = async (userId) => {
    const entries = await CartItem.find({ user: userId })
        .sort({ updatedAt: -1 })
        .populate({
            path: 'product',
            populate: { path: 'category', select: 'name slug' },
        })
        .lean();

    const staleEntryIds = [];
    const updates = [];

    const items = entries.reduce((accumulator, entry) => {
        if (!entry.product || !entry.product.isActive) {
            staleEntryIds.push(entry._id);
            return accumulator;
        }

        const stockQuantity = entry.product.stockQuantity ?? 0;

        if (stockQuantity <= 0) {
            staleEntryIds.push(entry._id);
            return accumulator;
        }

        const quantity = Math.min(entry.quantity, stockQuantity);

        if (quantity !== entry.quantity) {
            updates.push(CartItem.updateOne({ _id: entry._id }, { quantity }));
        }

        accumulator.push(formatCartItem({ ...entry, quantity }, entry.product));
        return accumulator;
    }, []);

    if (staleEntryIds.length > 0) {
        await CartItem.deleteMany({ _id: { $in: staleEntryIds } });
    }

    if (updates.length > 0) {
        await Promise.all(updates);
    }

    return items;
};

const clearUserCart = async (userId) => {
    await CartItem.deleteMany({ user: userId });
};

const getActiveProduct = async (productId) => {
    const product = await Product.findOne({ _id: productId, isActive: true })
        .populate({ path: 'category', select: 'name slug' });

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    return product;
};

const upsertCartQuantity = async (userId, product, quantity) => {
    const stockQuantity = product.stockQuantity ?? 0;

    if (stockQuantity <= 0) {
        throw new ApiError(400, 'Product is out of stock');
    }

    const nextQuantity = Math.min(quantity, stockQuantity);

    const existing = await CartItem.findOne({
        user: userId,
        product: product._id,
    });

    if (existing) {
        existing.quantity = nextQuantity;
        await existing.save();
        return;
    }

    await CartItem.create({
        user: userId,
        product: product._id,
        quantity: nextQuantity,
    });
};

const getMyCart = async (req, res) => {
    const items = await fetchCartItems(req.user._id);

    return res.status(200).json({
        success: true,
        data: items,
    });
};

const addCartItem = async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    const product = await getActiveProduct(productId);

    const existing = await CartItem.findOne({
        user: req.user._id,
        product: productId,
    });

    const stockQuantity = product.stockQuantity ?? 0;
    const requestedQuantity = existing
        ? existing.quantity + quantity
        : quantity;

    await upsertCartQuantity(req.user._id, product, requestedQuantity);

    const items = await fetchCartItems(req.user._id);

    return res.status(200).json({
        success: true,
        message: 'Added to cart',
        data: items,
    });
};

const updateCartItemQuantity = async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
        await CartItem.findOneAndDelete({
            user: req.user._id,
            product: productId,
        });

        const items = await fetchCartItems(req.user._id);

        return res.status(200).json({
            success: true,
            message: 'Removed from cart',
            data: items,
        });
    }

    const product = await getActiveProduct(productId);
    await upsertCartQuantity(req.user._id, product, quantity);

    const items = await fetchCartItems(req.user._id);

    return res.status(200).json({
        success: true,
        message: 'Cart updated',
        data: items,
    });
};

const removeCartItem = async (req, res) => {
    const { productId } = req.params;

    const deleted = await CartItem.findOneAndDelete({
        user: req.user._id,
        product: productId,
    });

    if (!deleted) {
        throw new ApiError(404, 'Cart item not found');
    }

    const items = await fetchCartItems(req.user._id);

    return res.status(200).json({
        success: true,
        message: 'Removed from cart',
        data: items,
    });
};

const clearCart = async (req, res) => {
    await clearUserCart(req.user._id);

    return res.status(200).json({
        success: true,
        message: 'Cart cleared',
        data: [],
    });
};

const mergeCartItems = async (req, res) => {
    const { items } = req.body;

    for (const item of items) {
        try {
            const product = await getActiveProduct(item.productId);
            const existing = await CartItem.findOne({
                user: req.user._id,
                product: item.productId,
            });

            const mergedQuantity = (existing?.quantity || 0) + item.quantity;
            await upsertCartQuantity(req.user._id, product, mergedQuantity);
        } catch {
            // Skip invalid or unavailable products during merge.
        }
    }

    const cartItems = await fetchCartItems(req.user._id);

    return res.status(200).json({
        success: true,
        message: 'Cart synced',
        data: cartItems,
    });
};

module.exports = {
    getMyCart,
    addCartItem,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    mergeCartItems,
    clearUserCart,
    fetchCartItems,
};
