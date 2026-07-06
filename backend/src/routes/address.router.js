const { Router } = require('express');
const router = Router();
const {
    getMyAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} = require('../controllers/address.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const joiValidate = require('../middlewares/joiValidate');
const {
    createAddressSchema,
    updateAddressSchema,
    addressIdParamsSchema,
} = require('../validators/schemas/address.schema');

router.get('/addresses', authenticate, authorize.customer, asyncHandler(getMyAddresses));
router.post('/addresses', authenticate, authorize.customer, joiValidate(createAddressSchema), asyncHandler(createAddress));
router.put(
    '/addresses/:id',
    authenticate,
    authorize.customer,
    joiValidate(addressIdParamsSchema, 'params'),
    joiValidate(updateAddressSchema),
    asyncHandler(updateAddress),
);
router.patch(
    '/addresses/:id/default',
    authenticate,
    authorize.customer,
    joiValidate(addressIdParamsSchema, 'params'),
    asyncHandler(setDefaultAddress),
);
router.delete(
    '/addresses/:id',
    authenticate,
    authorize.customer,
    joiValidate(addressIdParamsSchema, 'params'),
    asyncHandler(deleteAddress),
);

module.exports = router;
