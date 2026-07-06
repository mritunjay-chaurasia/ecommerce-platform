const { Router } = require('express');
const router = Router();
const {
    getOrders,
    getOrderById,
    updateOrderStatus,
    getAdminOrderInvoice,
} = require('../controllers/order.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const joiValidate = require('../middlewares/joiValidate');
const {
    listOrdersQuerySchema,
    orderIdParamsSchema,
    updateOrderStatusSchema,
} = require('../validators/schemas/order.schema');

router.get(
    '/orders',
    authenticate,
    authorize.admin,
    joiValidate(listOrdersQuerySchema, 'query'),
    asyncHandler(getOrders),
);
router.get(
    '/orders/:id',
    authenticate,
    authorize.admin,
    joiValidate(orderIdParamsSchema, 'params'),
    asyncHandler(getOrderById),
);
router.patch(
    '/orders/:id/status',
    authenticate,
    authorize.admin,
    joiValidate(orderIdParamsSchema, 'params'),
    joiValidate(updateOrderStatusSchema),
    asyncHandler(updateOrderStatus),
);
router.get(
    '/orders/:id/invoice',
    authenticate,
    authorize.admin,
    joiValidate(orderIdParamsSchema, 'params'),
    asyncHandler(getAdminOrderInvoice),
);

module.exports = router;
