const { Router } = require('express');
const router = Router();
const { getAdminDashboardStats } = require('../controllers/dashboard.controller');
const { getUsers, getUserById, updateUserStatus, updateUserVerification, updateUserRole } = require('../controllers/auth.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const joiValidate = require('../middlewares/joiValidate');
const {
    updateUserStatusSchema,
    updateUserVerificationSchema,
    updateUserRoleSchema,
} = require('../validators/schemas/user.schema');

router.get('/dashboard/stats', authenticate, authorize.admin, asyncHandler(getAdminDashboardStats));
router.get('/users', authenticate, authorize.admin, asyncHandler(getUsers));
router.get('/users/:id', authenticate, authorize.admin, asyncHandler(getUserById));
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
router.patch(
    '/users/:id/role',
    authenticate,
    authorize.admin,
    joiValidate(updateUserRoleSchema),
    asyncHandler(updateUserRole),
);

module.exports = router;
