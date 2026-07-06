const User = require('../models/auth.model');
const Category = require('../models/category.model');
const Product = require('../models/product.model');
const { Order } = require('../models/order.model');
const { Review } = require('../models/review.model');
const { ROLES } = require('../constants/roles');
const { formatRecentOrder } = require('../utils/formatters/order');
const {
    PAID_PAYMENT_STATUSES,
    PENDING_ORDER_STATUSES,
    ORDER_STATUS,
} = require('../../../shared/constants/order');
const { LOW_STOCK_THRESHOLD } = require('../../../shared/constants/inventory');

const getAdminDashboardStats = async (req, res) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
        totalUsers,
        totalCustomers,
        totalProducts,
        activeProducts,
        featuredProducts,
        lowStockProducts,
        totalCategories,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        pendingReviews,
        paidRevenueSummary,
        monthlyRevenueSummary,
        recentOrders,
        salesTrend,
        topProducts,
    ] = await Promise.all([
        User.countDocuments({ accountStatus: { $ne: 'deleted' } }),
        User.countDocuments({ role: ROLES.CUSTOMER, accountStatus: { $ne: 'deleted' } }),
        Product.countDocuments(),
        Product.countDocuments({ isActive: true }),
        Product.countDocuments({ isFeatured: true }),
        Product.countDocuments({ isActive: true, stockQuantity: { $lte: LOW_STOCK_THRESHOLD } }),
        Category.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: { $in: PENDING_ORDER_STATUSES } }),
        Order.countDocuments({ orderStatus: ORDER_STATUS.DELIVERED }),
        Order.countDocuments({ orderStatus: ORDER_STATUS.CANCELLED }),
        Review.countDocuments({ status: 'pending' }),
        Order.aggregate([
            {
                $match: {
                    paymentStatus: { $in: PAID_PAYMENT_STATUSES },
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    averageOrderValue: { $avg: '$totalAmount' },
                    paidOrders: { $sum: 1 },
                },
            },
        ]),
        Order.aggregate([
            {
                $match: {
                    paymentStatus: { $in: PAID_PAYMENT_STATUSES },
                    placedAt: { $gte: startOfMonth },
                },
            },
            {
                $group: {
                    _id: null,
                    monthlyRevenue: { $sum: '$totalAmount' },
                    monthlyOrders: { $sum: 1 },
                },
            },
        ]),
        Order.find()
            .sort({ placedAt: -1, createdAt: -1 })
            .limit(5)
            .lean(),
        Order.aggregate([
            {
                $match: {
                    placedAt: {
                        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$placedAt' },
                    },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productName',
                    quantitySold: { $sum: '$items.quantity' },
                    revenue: { $sum: '$items.lineTotal' },
                },
            },
            { $sort: { quantitySold: -1 } },
            { $limit: 5 },
        ]),
    ]);

    const revenue = paidRevenueSummary[0] || {};
    const monthly = monthlyRevenueSummary[0] || {};

    return res.status(200).json({
        success: true,
        data: {
            overview: {
                totalUsers,
                totalCustomers,
                totalProducts,
                activeProducts,
                featuredProducts,
                lowStockProducts,
                totalCategories,
                totalOrders,
                pendingOrders,
                deliveredOrders,
                cancelledOrders,
                pendingReviews,
            },
            sales: {
                totalRevenue: revenue.totalRevenue || 0,
                averageOrderValue: revenue.averageOrderValue || 0,
                paidOrders: revenue.paidOrders || 0,
                monthlyRevenue: monthly.monthlyRevenue || 0,
                monthlyOrders: monthly.monthlyOrders || 0,
            },
            recentOrders: recentOrders.map(formatRecentOrder),
            salesTrend: salesTrend.map((entry) => ({
                date: entry._id,
                revenue: entry.revenue,
                orders: entry.orders,
            })),
            topProducts: topProducts.map((entry) => ({
                productName: entry._id,
                quantitySold: entry.quantitySold,
                revenue: entry.revenue,
            })),
            thresholds: {
                lowStock: LOW_STOCK_THRESHOLD,
            },
        },
    });
};

module.exports = {
    getAdminDashboardStats,
};
