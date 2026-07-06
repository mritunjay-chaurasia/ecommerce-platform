const { Router } = require('express');
const router = Router();
const {
    createReturnRequest,
    getMyReturnRequests,
} = require('../controllers/return.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const joiValidate = require('../middlewares/joiValidate');
const {
    orderIdParamsSchema,
    createReturnRequestSchema,
} = require('../validators/schemas/return.schema');

router.post(
    '/orders/:orderId/return-request',
    authenticate,
    authorize.customer,
    joiValidate(orderIdParamsSchema, 'params'),
    joiValidate(createReturnRequestSchema),
    asyncHandler(createReturnRequest),
);

router.get('/returns/my', authenticate, authorize.customer, asyncHandler(getMyReturnRequests));

module.exports = router;
