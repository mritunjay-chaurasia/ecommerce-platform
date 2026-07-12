const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const { Order } = require('../models/order.model');
const { Review } = require('../models/review.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const escapeRegex = require('../utils/escapeRegex');
const { buildCheckoutSummary } = require('../utils/checkout');
const { formatCustomerOrder } = require('../utils/formatters/order');
const { formatStoreProduct } = require('../utils/formatters/product');
const { getStoreSettings } = require('../utils/storeSettings');
const { notifyOrderConfirmation, notifyOrderCancellation } = require('../templates/orderEmails');
const { placeOrder } = require('../utils/placeOrder');
const { renderInvoiceHtml } = require('../utils/renderInvoice');
const { CANCELLABLE_ORDER_STATUSES, ORDER_STATUS } = require('../../../shared/constants/order');
const { getEffectivePrice } = require('../../../shared/utils/pricing');
const {
    buildActiveProductCatalogFilter,
    resolveCategoryRef,
    resolveSubcategoryRef,
} = require('../utils/storeCategoryHelpers');
const { buildPagination, hasPaginationQuery, parsePaginationQuery } = require('../utils/pagination');

const getProductReviewStats = async (productIds) => {
    if (!productIds.length) {
        return {};
    }

    const stats = await Review.aggregate([
        {
            $match: {
                product: { $in: productIds },
                status: 'approved',
            },
        },
        {
            $group: {
                _id: '$product',
                avgRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 },
            },
        },
    ]);

    return stats.reduce((accumulator, item) => {
        accumulator[String(item._id)] = {
            avgRating: Number(item.avgRating.toFixed(1)),
            reviewCount: item.reviewCount,
        };
        return accumulator;
    }, {});
};

const getStoreProduct = async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findOne({ _id: productId, isActive: true })
        .populate('category', 'name slug')
        .lean();

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    const reviewStats = await getProductReviewStats([product._id]);

    return res.status(200).json({
        success: true,
        data: formatStoreProduct(product, reviewStats),
    });
};

const getStoreCategories = async (req, res) => {
    const [rootCategories, subcategories] = await Promise.all([
        Category.find({ isActive: true })
            .sort({ name: 1 })
            .select('name slug description')
            .lean(),
        Subcategory.find({ isActive: true })
            .sort({ name: 1 })
            .select('name slug description category')
            .lean(),
    ]);

    const subcategoriesByCategory = subcategories.reduce((groups, subcategory) => {
        const categoryId = String(subcategory.category);
        if (!groups[categoryId]) {
            groups[categoryId] = [];
        }
        groups[categoryId].push({
            id: String(subcategory._id),
            name: subcategory.name,
            slug: subcategory.slug,
            description: subcategory.description || '',
        });
        return groups;
    }, {});

    return res.status(200).json({
        success: true,
        data: rootCategories.map((category) => ({
            id: String(category._id),
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            subcategories: subcategoriesByCategory[String(category._id)] || [],
        })),
    });
};

const getStoreBrands = async (req, res) => {
    const catalogFilter = await buildActiveProductCatalogFilter();
    const brands = await Product.distinct('brand', {
        isActive: true,
        ...catalogFilter,
        brand: { $nin: ['', null] },
    });

    return res.status(200).json({
        success: true,
        data: brands.sort((left, right) => left.localeCompare(right)),
    });
};

const getStoreProducts = async (req, res) => {
    const catalogFilter = await buildActiveProductCatalogFilter();
    const filter = { isActive: true, ...catalogFilter };
    const search = req.query.search?.trim();
    const sort = req.query.sort || 'newest';

    if (req.query.subcategory) {
        const subcategory = await resolveSubcategoryRef(req.query.subcategory, { activeOnly: true });

        if (!subcategory) {
            return res.status(200).json({ success: true, data: [] });
        }

        filter.subcategory = subcategory._id;
        filter.category = subcategory.category;
    } else if (req.query.category) {
        const category = await resolveCategoryRef(req.query.category, { activeOnly: true });

        if (!category) {
            return res.status(200).json({ success: true, data: [] });
        }

        filter.category = category._id;
    }

    if (req.query.featured !== undefined) {
        filter.isFeatured = req.query.featured;
    }

    if (req.query.ids) {
        filter._id = { $in: req.query.ids.split(',').map((id) => id.trim()).filter(Boolean) };
    }

    const brand = req.query.brand?.trim();

    if (brand) {
        filter.brand = { $regex: new RegExp(`^${escapeRegex(brand)}$`, 'i') };
    }

    if (search) {
        const safeSearch = escapeRegex(search);
        filter.$and = [
            ...(filter.$and || []),
            {
                $or: [
                    { name: { $regex: safeSearch, $options: 'i' } },
                    { brand: { $regex: safeSearch, $options: 'i' } },
                    { sku: { $regex: safeSearch, $options: 'i' } },
                ],
            },
        ];
    }

    const productsRaw = await Product.find(filter)
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .lean();

    let products = productsRaw;

    if (req.query.inStock) {
        products = products.filter((product) => product.stockQuantity > 0);
    }

    const minPrice = req.query.minPrice !== undefined && req.query.minPrice !== ''
        ? Number(req.query.minPrice)
        : null;
    const maxPrice = req.query.maxPrice !== undefined && req.query.maxPrice !== ''
        ? Number(req.query.maxPrice)
        : null;

    if (minPrice !== null && !Number.isNaN(minPrice)) {
        products = products.filter((product) => getEffectivePrice(product) >= minPrice);
    }

    if (maxPrice !== null && !Number.isNaN(maxPrice)) {
        products = products.filter((product) => getEffectivePrice(product) <= maxPrice);
    }

    const reviewStats = await getProductReviewStats(products.map((product) => product._id));

    if (sort === 'price_asc') {
        products.sort((left, right) => getEffectivePrice(left) - getEffectivePrice(right));
    } else if (sort === 'price_desc') {
        products.sort((left, right) => getEffectivePrice(right) - getEffectivePrice(left));
    } else if (sort === 'rating') {
        const stats = reviewStats;
        products.sort((left, right) => {
            const leftRating = stats[String(left._id)]?.avgRating || 0;
            const rightRating = stats[String(right._id)]?.avgRating || 0;
            return rightRating - leftRating;
        });
    } else {
        products.sort((left, right) => {
            if (left.isFeatured !== right.isFeatured) {
                return Number(right.isFeatured) - Number(left.isFeatured);
            }

            return new Date(right.createdAt) - new Date(left.createdAt);
        });
    }

    const formattedProducts = products.map((product) => formatStoreProduct(product, reviewStats));

    if (hasPaginationQuery(req.query)) {
        const { page, limit, skip } = parsePaginationQuery(req.query, {
            defaultLimit: 12,
            maxLimit: 48,
        });
        const paginatedProducts = formattedProducts.slice(skip, skip + limit);

        return res.status(200).json({
            success: true,
            data: paginatedProducts,
            pagination: buildPagination(page, limit, formattedProducts.length),
        });
    }

    return res.status(200).json({
        success: true,
        data: formattedProducts,
    });
};

const getRelatedProducts = async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findOne({ _id: productId, isActive: true }).lean();

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    const relatedProducts = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
        isActive: true,
    })
        .populate('category', 'name slug')
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(8)
        .lean();

    const reviewStats = await getProductReviewStats(relatedProducts.map((item) => item._id));

    return res.status(200).json({
        success: true,
        data: relatedProducts.map((item) => formatStoreProduct(item, reviewStats)),
    });
};

const getCheckoutSummary = async (req, res) => {
    const summary = await buildCheckoutSummary(req.body);

    return res.status(200).json({
        success: true,
        data: summary,
    });
};

const createStoreOrder = async (req, res) => {
    if (!req.user && !req.body.shippingAddress?.email) {
        throw new ApiError(400, 'Email is required for guest checkout');
    }

    const order = await placeOrder({ body: req.body, user: req.user || null });

    notifyOrderConfirmation(order);

    if (req.user) {
        const { clearUserCart } = require('../controllers/cart.controller');
        await clearUserCart(req.user._id);
    }

    return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: formatCustomerOrder(order),
    });
};

const renderOrderInvoiceResponse = async (res, order) => {
    const settings = await getStoreSettings();

    const html = await renderInvoiceHtml({
        storeName: settings.storeName,
        currency: settings.currency,
        order,
        issuedAt: new Date(order.placedAt || order.createdAt).toLocaleString('en-IN'),
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
};

const getMyOrderInvoice = async (req, res) => {
    const order = await Order.findOne({
        _id: req.params.orderId,
        'customer.user': req.user._id,
    }).lean();

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    return renderOrderInvoiceResponse(res, order);
};

const getMyOrders = async (req, res) => {
    const [orders, settings] = await Promise.all([
        Order.find({ 'customer.user': req.user._id })
            .sort({ placedAt: -1, createdAt: -1 })
            .lean(),
        getStoreSettings(),
    ]);

    return res.status(200).json({
        success: true,
        data: orders.map((order) => ({
            ...formatCustomerOrder(order),
            currency: settings.currency,
        })),
    });
};

const getMyOrderById = async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findOne({
        _id: orderId,
        'customer.user': req.user._id,
    }).lean();

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    const settings = await getStoreSettings();

    return res.status(200).json({
        success: true,
        data: {
            ...formatCustomerOrder(order),
            currency: settings.currency,
        },
    });
};

const cancelMyOrder = async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findOne({
        _id: orderId,
        'customer.user': req.user._id,
    });

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    if (!CANCELLABLE_ORDER_STATUSES.includes(order.orderStatus)) {
        throw new ApiError(400, 'This order can no longer be cancelled');
    }

    for (const item of order.items) {
        if (item.product) {
            await Product.updateOne(
                { _id: item.product },
                { $inc: { stockQuantity: item.quantity } },
            );
        }
    }

    order.orderStatus = ORDER_STATUS.CANCELLED;

    if (req.body.reason?.trim()) {
        order.notes = [order.notes, `Cancellation reason: ${req.body.reason.trim()}`]
            .filter(Boolean)
            .join('\n');
    }

    await order.save();

    notifyOrderCancellation(order);

    const settings = await getStoreSettings();

    return res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: {
            ...formatCustomerOrder(order.toObject()),
            currency: settings.currency,
        },
    });
};

module.exports = {
    getStoreCategories,
    getStoreBrands,
    getStoreProduct,
    getStoreProducts,
    getRelatedProducts,
    getCheckoutSummary,
    createStoreOrder,
    getMyOrderInvoice,
    getMyOrders,
    getMyOrderById,
    cancelMyOrder,
};
