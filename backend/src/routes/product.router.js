const { Router } = require('express');
const router = Router();
const {
    getProducts,
    getInventoryProducts,
    createProduct,
    updateProduct,
    updateProductStock,
    deleteProduct,
    exportProductsCsv,
} = require('../controllers/product.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const joiValidate = require('../middlewares/joiValidate');
const {
    createProductSchema,
    listProductsQuerySchema,
    updateProductSchema,
} = require('../validators/schemas/product.schema');
const {
    listInventoryQuerySchema,
    productIdParamsSchema,
    updateProductStockSchema,
} = require('../validators/schemas/inventory.schema');

router.get(
    '/products/export',
    authenticate,
    authorize.admin,
    asyncHandler(exportProductsCsv),
);
router.get(
    '/products',
    authenticate,
    authorize.admin,
    joiValidate(listProductsQuerySchema, 'query'),
    asyncHandler(getProducts),
);
router.get(
    '/inventory',
    authenticate,
    authorize.admin,
    joiValidate(listInventoryQuerySchema, 'query'),
    asyncHandler(getInventoryProducts),
);
router.post(
    '/products',
    authenticate,
    authorize.admin,
    joiValidate(createProductSchema),
    asyncHandler(createProduct),
);
router.put(
    '/products/:id',
    authenticate,
    authorize.admin,
    joiValidate(productIdParamsSchema, 'params'),
    joiValidate(updateProductSchema),
    asyncHandler(updateProduct),
);
router.patch(
    '/products/:id/stock',
    authenticate,
    authorize.admin,
    joiValidate(productIdParamsSchema, 'params'),
    joiValidate(updateProductStockSchema),
    asyncHandler(updateProductStock),
);
router.delete(
    '/products/:id',
    authenticate,
    authorize.admin,
    joiValidate(productIdParamsSchema, 'params'),
    asyncHandler(deleteProduct),
);

module.exports = router;
