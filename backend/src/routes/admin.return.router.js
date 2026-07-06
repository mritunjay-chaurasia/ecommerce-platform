const { Router } = require('express');
const router = Router();
const {
    getAdminReturnRequests,
    updateReturnRequestStatus,
} = require('../controllers/return.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const joiValidate = require('../middlewares/joiValidate');
const {
    returnIdParamsSchema,
    updateReturnRequestSchema,
    listReturnRequestsQuerySchema,
} = require('../validators/schemas/return.schema');

router.get(
    '/returns',
    authenticate,
    authorize.admin,
    joiValidate(listReturnRequestsQuerySchema, 'query'),
    asyncHandler(getAdminReturnRequests),
);

router.patch(
    '/returns/:id/status',
    authenticate,
    authorize.admin,
    joiValidate(returnIdParamsSchema, 'params'),
    joiValidate(updateReturnRequestSchema),
    asyncHandler(updateReturnRequestStatus),
);

module.exports = router;
