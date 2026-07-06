const { Router } = require('express');
const router = Router();
const {
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
} = require('../controllers/coupon.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const joiValidate = require('../middlewares/joiValidate');
const {
    listCouponsQuerySchema,
    couponIdParamsSchema,
    createCouponSchema,
    updateCouponSchema,
} = require('../validators/schemas/coupon.schema');

router.get(
    '/coupons',
    authenticate,
    authorize.admin,
    joiValidate(listCouponsQuerySchema, 'query'),
    asyncHandler(getCoupons),
);
router.post(
    '/coupons',
    authenticate,
    authorize.admin,
    joiValidate(createCouponSchema),
    asyncHandler(createCoupon),
);
router.put(
    '/coupons/:id',
    authenticate,
    authorize.admin,
    joiValidate(couponIdParamsSchema, 'params'),
    joiValidate(updateCouponSchema),
    asyncHandler(updateCoupon),
);
router.delete(
    '/coupons/:id',
    authenticate,
    authorize.admin,
    joiValidate(couponIdParamsSchema, 'params'),
    asyncHandler(deleteCoupon),
);

module.exports = router;
