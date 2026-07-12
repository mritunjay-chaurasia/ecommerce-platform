const Subcategory = require('../models/subcategory.model');
const Category = require('../models/category.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const escapeRegex = require('../utils/escapeRegex');
const buildUniqueSlug = require('../utils/buildUniqueSlug');
const { buildPagination, hasPaginationQuery, parsePaginationQuery } = require('../utils/pagination');

const formatSubcategory = (subcategory) => ({
    id: subcategory._id,
    name: subcategory.name,
    slug: subcategory.slug,
    description: subcategory.description,
    category: subcategory.category?._id || subcategory.category,
    categoryName: subcategory.category?.name || '',
    isActive: subcategory.isActive,
    createdAt: subcategory.createdAt,
    updatedAt: subcategory.updatedAt,
});

const ensureCategoryExists = async (categoryId) => {
    const category = await Category.findById(categoryId).select('_id name').lean();

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    return category;
};

const findDuplicateSubcategoryName = async ({ name, categoryId, excludeId = null }) => {
    const filter = {
        name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
        category: categoryId,
    };

    if (excludeId) {
        filter._id = { $ne: excludeId };
    }

    return Subcategory.findOne(filter).select('_id').lean();
};

const getSubcategories = async (req, res) => {
    const search = req.query.search?.trim();
    const filter = {};

    if (req.query.category) {
        filter.category = req.query.category;
    }

    if (search) {
        const safeSearch = escapeRegex(search);
        filter.$or = [
            { name: { $regex: safeSearch, $options: 'i' } },
            { slug: { $regex: safeSearch, $options: 'i' } },
            { description: { $regex: safeSearch, $options: 'i' } },
        ];
    }

    if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive;
    }

    if (hasPaginationQuery(req.query)) {
        const { page, limit, skip } = parsePaginationQuery(req.query);

        const [subcategories, total] = await Promise.all([
            Subcategory.find(filter)
                .populate('category', 'name slug')
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Subcategory.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: subcategories.map(formatSubcategory),
            pagination: buildPagination(page, limit, total),
        });
    }

    const subcategories = await Subcategory.find(filter)
        .populate('category', 'name slug')
        .sort({ name: 1 })
        .lean();

    return res.status(200).json({
        success: true,
        data: subcategories.map(formatSubcategory),
    });
};

const createSubcategory = async (req, res) => {
    const { name, description, isActive, category } = req.body;

    await ensureCategoryExists(category);

    const existingName = await findDuplicateSubcategoryName({ name, categoryId: category });

    if (existingName) {
        throw new ApiError(409, 'Subcategory name already exists for this category');
    }

    const slug = await buildUniqueSlug(Subcategory, name, {
        emptyNameMessage: 'Subcategory name must contain valid characters',
    });

    const subcategory = await Subcategory.create({
        name,
        slug,
        description: description || '',
        category,
        isActive: isActive ?? true,
    });

    await subcategory.populate('category', 'name slug');

    return res.status(201).json({
        success: true,
        message: 'Subcategory created successfully',
        data: formatSubcategory(subcategory),
    });
};

const updateSubcategory = async (req, res) => {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const subcategory = await Subcategory.findById(id);

    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }

    if (name && name.toLowerCase() !== subcategory.name.toLowerCase()) {
        const existingName = await findDuplicateSubcategoryName({
            name,
            categoryId: subcategory.category,
            excludeId: id,
        });

        if (existingName) {
            throw new ApiError(409, 'Subcategory name already exists for this category');
        }

        subcategory.name = name;
        subcategory.slug = await buildUniqueSlug(Subcategory, name, {
            excludeId: id,
            emptyNameMessage: 'Subcategory name must contain valid characters',
        });
    }

    if (description !== undefined) {
        subcategory.description = description;
    }

    if (isActive !== undefined) {
        subcategory.isActive = isActive;
    }

    await subcategory.save();
    await subcategory.populate('category', 'name slug');

    return res.status(200).json({
        success: true,
        message: 'Subcategory updated successfully',
        data: formatSubcategory(subcategory),
    });
};

const deleteSubcategory = async (req, res) => {
    const { id } = req.params;

    const subcategory = await Subcategory.findById(id);

    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }

    const linkedProducts = await Product.countDocuments({ subcategory: id });

    if (linkedProducts > 0) {
        throw new ApiError(
            409,
            `Cannot delete subcategory while ${linkedProducts} product(s) are assigned to it`,
        );
    }

    await subcategory.deleteOne();

    return res.status(200).json({
        success: true,
        message: 'Subcategory deleted successfully',
    });
};

module.exports = {
    getSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
};
