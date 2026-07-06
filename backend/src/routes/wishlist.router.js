const { Router } = require('express');
const router = Router();
const {
    getMyWishlist,
    addToWishlist,
    toggleWishlistItem,
    removeFromWishlist,
} = require('../controllers/wishlist.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const joiValidate = require('../middlewares/joiValidate');
const {
    productIdBodySchema,
    productIdParamsSchema,
} = require('../validators/schemas/wishlist.schema');

router.get('/wishlist/my', authenticate, authorize.customer, asyncHandler(getMyWishlist));
router.post('/wishlist', authenticate, authorize.customer, joiValidate(productIdBodySchema), asyncHandler(addToWishlist));
router.post('/wishlist/toggle', authenticate, authorize.customer, joiValidate(productIdBodySchema), asyncHandler(toggleWishlistItem));
router.delete(
    '/wishlist/:productId',
    authenticate,
    authorize.customer,
    joiValidate(productIdParamsSchema, 'params'),
    asyncHandler(removeFromWishlist),
);

module.exports = router;
