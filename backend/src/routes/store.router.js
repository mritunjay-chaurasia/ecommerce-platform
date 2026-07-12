const { Router } = require('express');
const router = Router();
const {
    getStoreCategories,
    getStoreBrands,
    getStoreProduct,
    getStoreProducts,
    getCheckoutSummary,
    createStoreOrder,
    getMyOrderInvoice,
    getMyOrders,
    getMyOrderById,
    cancelMyOrder,
    getRelatedProducts,
} = require('../controllers/store.controller');
const { getStoreBanners } = require('../controllers/banner.controller');
const { getPublicStoreSettings } = require('../controllers/settings.controller');
const { createCustomerReview, getProductReviews, getMyProductReview } = require('../controllers/review.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const optionalAuthenticate = require('../middlewares/optionalAuthenticate');
const joiValidate = require('../middlewares/joiValidate');
const {
    listStoreProductsQuerySchema,
    checkoutSummarySchema,
    createStoreOrderSchema,
    orderIdParamsSchema,
    cancelOrderSchema,
} = require('../validators/schemas/store.schema');
const { listStoreBannersQuerySchema } = require('../validators/schemas/banner.schema');
const { createReviewSchema, productIdParamsSchema, myReviewQuerySchema } = require('../validators/schemas/review.schema');

router.get('/categories', asyncHandler(getStoreCategories));
router.get('/brands', asyncHandler(getStoreBrands));
router.get('/products', joiValidate(listStoreProductsQuerySchema, 'query'), asyncHandler(getStoreProducts));
router.get('/products/:productId', joiValidate(productIdParamsSchema, 'params'), asyncHandler(getStoreProduct));
router.get(
    '/products/:productId/related',
    joiValidate(productIdParamsSchema, 'params'),
    asyncHandler(getRelatedProducts),
);
router.get('/settings', asyncHandler(getPublicStoreSettings));
router.get('/banners', joiValidate(listStoreBannersQuerySchema, 'query'), asyncHandler(getStoreBanners));
router.get('/reviews/product/:productId', joiValidate(productIdParamsSchema, 'params'), asyncHandler(getProductReviews));
router.get(
    '/reviews/my',
    authenticate,
    authorize.customer,
    joiValidate(myReviewQuerySchema, 'query'),
    asyncHandler(getMyProductReview),
);
router.post(
    '/reviews',
    authenticate,
    authorize.customer,
    joiValidate(createReviewSchema),
    asyncHandler(createCustomerReview),
);
router.post(
    '/checkout/summary',
    optionalAuthenticate,
    joiValidate(checkoutSummarySchema),
    asyncHandler(getCheckoutSummary),
);
router.post(
    '/orders',
    optionalAuthenticate,
    joiValidate(createStoreOrderSchema),
    asyncHandler(createStoreOrder),
);
router.get('/orders/my', authenticate, authorize.customer, asyncHandler(getMyOrders));
router.get(
    '/orders/:orderId',
    authenticate,
    authorize.customer,
    joiValidate(orderIdParamsSchema, 'params'),
    asyncHandler(getMyOrderById),
);
router.get(
    '/orders/:orderId/invoice',
    authenticate,
    authorize.customer,
    joiValidate(orderIdParamsSchema, 'params'),
    asyncHandler(getMyOrderInvoice),
);
router.patch(
    '/orders/:orderId/cancel',
    authenticate,
    authorize.customer,
    joiValidate(orderIdParamsSchema, 'params'),
    joiValidate(cancelOrderSchema),
    asyncHandler(cancelMyOrder),
);

module.exports = router;
