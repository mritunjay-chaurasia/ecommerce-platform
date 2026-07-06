const { Router } = require('express');
const router = Router();
const {
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
} = require('../controllers/banner.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const joiValidate = require('../middlewares/joiValidate');
const {
    listBannersQuerySchema,
    bannerIdParamsSchema,
    createBannerSchema,
    updateBannerSchema,
} = require('../validators/schemas/banner.schema');

router.get('/banners', authenticate, authorize.admin, joiValidate(listBannersQuerySchema, 'query'), asyncHandler(getBanners));
router.post(
    '/banners',
    authenticate,
    authorize.admin,
    joiValidate(createBannerSchema),
    asyncHandler(createBanner),
);
router.put(
    '/banners/:id',
    authenticate,
    authorize.admin,
    joiValidate(bannerIdParamsSchema, 'params'),
    joiValidate(updateBannerSchema),
    asyncHandler(updateBanner),
);
router.delete(
    '/banners/:id',
    authenticate,
    authorize.admin,
    joiValidate(bannerIdParamsSchema, 'params'),
    asyncHandler(deleteBanner),
);

module.exports = router;
