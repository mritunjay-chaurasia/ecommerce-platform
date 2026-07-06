const { Router } = require('express');
const router = Router();
const {
    getMyCart,
    addCartItem,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    mergeCartItems,
} = require('../controllers/cart.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const joiValidate = require('../middlewares/joiValidate');
const {
    cartItemPayloadSchema,
    updateCartQuantitySchema,
    productIdParamsSchema,
    mergeCartSchema,
} = require('../validators/schemas/cart.schema');

router.get('/cart/my', authenticate, authorize.customer, asyncHandler(getMyCart));
router.post('/cart/items', authenticate, authorize.customer, joiValidate(cartItemPayloadSchema), asyncHandler(addCartItem));
router.post('/cart/merge', authenticate, authorize.customer, joiValidate(mergeCartSchema), asyncHandler(mergeCartItems));
router.put(
    '/cart/items/:productId',
    authenticate,
    authorize.customer,
    joiValidate(productIdParamsSchema, 'params'),
    joiValidate(updateCartQuantitySchema),
    asyncHandler(updateCartItemQuantity),
);
router.delete(
    '/cart/items/:productId',
    authenticate,
    authorize.customer,
    joiValidate(productIdParamsSchema, 'params'),
    asyncHandler(removeCartItem),
);
router.delete('/cart', authenticate, authorize.customer, asyncHandler(clearCart));

module.exports = router;
