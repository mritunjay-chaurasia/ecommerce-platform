const mongoose = require('mongoose');
const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const ApiError = require('./ApiError');

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value)
    && String(new mongoose.Types.ObjectId(value)) === value;

const resolveCategoryRef = async (value, { activeOnly = false } = {}) => {
    if (!value) {
        return null;
    }

    const filter = isObjectId(value)
        ? { _id: value }
        : { slug: String(value).trim().toLowerCase() };

    if (activeOnly) {
        filter.isActive = true;
    }

    return Category.findOne(filter).select('_id name slug isActive').lean();
};

const resolveSubcategoryRef = async (value, { categoryId = null, activeOnly = false } = {}) => {
    if (!value) {
        return null;
    }

    const filter = isObjectId(value)
        ? { _id: value }
        : { slug: String(value).trim().toLowerCase() };

    if (categoryId) {
        filter.category = categoryId;
    }

    if (activeOnly) {
        filter.isActive = true;
    }

    return Subcategory.findOne(filter).select('_id name slug category isActive').lean();
};

const getActiveCatalogIds = async () => {
    const [categoryIds, subcategoryIds] = await Promise.all([
        Category.find({ isActive: true }).distinct('_id'),
        Subcategory.find({ isActive: true }).distinct('_id'),
    ]);

    return { categoryIds, subcategoryIds };
};

const buildActiveProductCatalogFilter = async () => {
    const { categoryIds, subcategoryIds } = await getActiveCatalogIds();

    return {
        $and: [
            { category: { $in: categoryIds } },
            {
                $or: [
                    { subcategory: null },
                    { subcategory: { $in: subcategoryIds } },
                ],
            },
        ],
    };
};

module.exports = {
    isObjectId,
    resolveCategoryRef,
    resolveSubcategoryRef,
    getActiveCatalogIds,
    buildActiveProductCatalogFilter,
};
