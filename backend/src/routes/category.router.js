const { Router } = require('express');
const router = Router();
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/category.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const joiValidate = require('../middlewares/joiValidate');
const {
    createCategorySchema,
    listCategoriesQuerySchema,
    updateCategorySchema,
} = require('../validators/schemas/category.schema');



router.get(
    '/categories',
    authenticate,
    authorize.admin,
    joiValidate(listCategoriesQuerySchema, 'query'),
    asyncHandler(getCategories),
);
router.post(
    '/categories',
    authenticate,
    authorize.admin,
    joiValidate(createCategorySchema),
    asyncHandler(createCategory),
);
router.put(
    '/categories/:id',
    authenticate,
    authorize.admin,
    joiValidate(updateCategorySchema),
    asyncHandler(updateCategory),
);
router.delete('/categories/:id', authenticate, authorize.admin, asyncHandler(deleteCategory));

module.exports = router;
