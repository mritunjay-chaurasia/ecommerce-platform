const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const ApiError = require('./ApiError');

const ensureRootCategory = async (categoryId) => {
    const category = await Category.findById(categoryId).select('_id name isActive').lean();

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    return category;
};

const ensureSubcategoryForCategory = async (subcategoryId, categoryId) => {
    if (!subcategoryId) {
        return null;
    }

    const subcategory = await Subcategory.findById(subcategoryId).select('_id category name isActive').lean();

    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }

    if (String(subcategory.category) !== String(categoryId)) {
        throw new ApiError(400, 'Subcategory must belong to the selected category');
    }

    return subcategory;
};

const validateProductCategories = async (categoryId, subcategoryId) => {
    await ensureRootCategory(categoryId);

    const activeSubcategoryCount = await Subcategory.countDocuments({
        category: categoryId,
        isActive: true,
    });

    if (activeSubcategoryCount > 0 && !subcategoryId) {
        throw new ApiError(400, 'Subcategory is required because this category has subcategories');
    }

    if (subcategoryId) {
        await ensureSubcategoryForCategory(subcategoryId, categoryId);
    }
};

module.exports = {
    ensureRootCategory,
    ensureSubcategoryForCategory,
    validateProductCategories,
};
