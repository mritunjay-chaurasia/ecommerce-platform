const { Router } = require('express');
const router = Router();
const { getAdminDashboardStats } = require('../controllers/dashboard.controller');
const { getUsers, updateUserStatus, updateUserVerification } = require('../controllers/auth.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const joiValidate = require('../middlewares/joiValidate');
const {
    updateUserStatusSchema,
    updateUserVerificationSchema,
} = require('../validators/schemas/user.schema');

router.get('/dashboard/stats', authenticate, authorize.admin, asyncHandler(getAdminDashboardStats));
router.get('/users', authenticate, authorize.admin, asyncHandler(getUsers));
router.patch(
    '/users/:id/status',
    authenticate,
    authorize.admin,
    joiValidate(updateUserStatusSchema),
    asyncHandler(updateUserStatus),
);
router.patch(
    '/users/:id/verification',
    authenticate,
    authorize.admin,
    joiValidate(updateUserVerificationSchema),
    asyncHandler(updateUserVerification),
);

module.exports = router;
