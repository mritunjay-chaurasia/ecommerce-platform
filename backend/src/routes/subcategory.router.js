const { Router } = require('express');
const router = Router();
const {
    getSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
} = require('../controllers/subcategory.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const joiValidate = require('../middlewares/joiValidate');
const {
    createSubcategorySchema,
    listSubcategoriesQuerySchema,
    updateSubcategorySchema,
} = require('../validators/schemas/subcategory.schema');

router.get(
    '/subcategories',
    authenticate,
    authorize.admin,
    joiValidate(listSubcategoriesQuerySchema, 'query'),
    asyncHandler(getSubcategories),
);
router.post(
    '/subcategories',
    authenticate,
    authorize.admin,
    joiValidate(createSubcategorySchema),
    asyncHandler(createSubcategory),
);
router.put(
    '/subcategories/:id',
    authenticate,
    authorize.admin,
    joiValidate(updateSubcategorySchema),
    asyncHandler(updateSubcategory),
);
router.delete('/subcategories/:id', authenticate, authorize.admin, asyncHandler(deleteSubcategory));

module.exports = router;
