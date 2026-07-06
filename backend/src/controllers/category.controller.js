const Category = require('../models/category.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const escapeRegex = require('../utils/escapeRegex');
const buildUniqueSlug = require('../utils/buildUniqueSlug');

const formatCategory = (category) => ({
    id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
});

const getCategories = async (req, res) => {
    const categories = await Category.find()
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        data: categories.map(formatCategory),
    });
};

const createCategory = async (req, res) => {
    const { name, description, isActive } = req.body;

    const existingName = await Category.findOne({
        name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
    });

    if (existingName) {
        throw new ApiError(409, 'Category name already exists');
    }

    const slug = await buildUniqueSlug(Category, name, {
        emptyNameMessage: 'Category name must contain valid characters',
    });

    const category = await Category.create({
        name,
        slug,
        description: description || '',
        isActive: isActive ?? true,
    });

    return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: formatCategory(category),
    });
};

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await Category.findById(id);

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
        const existingName = await Category.findOne({
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
        });

        if (existingName) {
            throw new ApiError(409, 'Category name already exists');
        }

        category.name = name;
        category.slug = await buildUniqueSlug(Category, name, {
            excludeId: id,
            emptyNameMessage: 'Category name must contain valid characters',
        });
    }

    if (description !== undefined) {
        category.description = description;
    }

    if (isActive !== undefined) {
        category.isActive = isActive;
    }

    await category.save();

    return res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: formatCategory(category),
    });
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    const linkedProducts = await Product.countDocuments({ category: id });

    if (linkedProducts > 0) {
        throw new ApiError(
            409,
            `Cannot delete category while ${linkedProducts} product(s) are assigned to it`,
        );
    }

    await category.deleteOne();

    return res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
    });
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
