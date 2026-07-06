const { Router } = require('express');
const router = Router();
const {
    getAdminStoreSettings,
    updateAdminStoreSettings,
} = require('../controllers/settings.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const joiValidate = require('../middlewares/joiValidate');
const { updateStoreSettingsSchema } = require('../validators/schemas/settings.schema');

router.get('/settings', authenticate, authorize.admin, asyncHandler(getAdminStoreSettings));
router.put(
    '/settings',
    authenticate,
    authorize.admin,
    joiValidate(updateStoreSettingsSchema),
    asyncHandler(updateAdminStoreSettings),
);

module.exports = router;
