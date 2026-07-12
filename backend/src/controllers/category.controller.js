const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const escapeRegex = require('../utils/escapeRegex');
const buildUniqueSlug = require('../utils/buildUniqueSlug');
const { buildPagination, hasPaginationQuery, parsePaginationQuery } = require('../utils/pagination');

const formatCategory = (category, extras = {}) => ({
    id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    ...extras,
});

const attachSubcategoryCounts = async (categories) => {
    if (!categories.length) {
        return categories.map((category) => formatCategory(category, { subcategoryCount: 0 }));
    }

    const counts = await Subcategory.aggregate([
        { $match: { category: { $in: categories.map((category) => category._id) } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = counts.reduce((map, entry) => {
        map[String(entry._id)] = entry.count;
        return map;
    }, {});

    return categories.map((category) => formatCategory(category, {
        subcategoryCount: countMap[String(category._id)] || 0,
    }));
};

const attachSubcategories = async (categories) => {
    if (!categories.length) {
        return [];
    }

    const categoryIds = categories.map((category) => category._id);
    const subcategories = await Subcategory.find({ category: { $in: categoryIds } })
        .sort({ name: 1 })
        .lean();

    const subcategoriesByCategory = subcategories.reduce((groups, subcategory) => {
        const categoryId = String(subcategory.category);
        if (!groups[categoryId]) {
            groups[categoryId] = [];
        }
        groups[categoryId].push({
            id: String(subcategory._id),
            name: subcategory.name,
            slug: subcategory.slug,
            description: subcategory.description || '',
            category: categoryId,
            isActive: subcategory.isActive,
        });
        return groups;
    }, {});

    return categories.map((category) => ({
        ...formatCategory(category),
        subcategories: subcategoriesByCategory[String(category._id)] || [],
        subcategoryCount: subcategoriesByCategory[String(category._id)]?.length || 0,
    }));
};

const getCategories = async (req, res) => {
    const search = req.query.search?.trim();
    const filter = {};
    const includeSubcategories = req.query.includeSubcategories === 'true'
        || req.query.includeSubcategories === true;

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

        const [categories, total] = await Promise.all([
            Category.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Category.countDocuments(filter),
        ]);

        const data = includeSubcategories
            ? await attachSubcategories(categories)
            : await attachSubcategoryCounts(categories);

        return res.status(200).json({
            success: true,
            data,
            pagination: buildPagination(page, limit, total),
        });
    }

    const categories = await Category.find(filter)
        .sort({ name: 1 })
        .lean();

    const data = includeSubcategories
        ? await attachSubcategories(categories)
        : categories.map((category) => formatCategory(category));

    return res.status(200).json({
        success: true,
        data,
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

    const conflictingSubcategory = await Subcategory.findOne({
        name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
    }).populate('category', 'name').lean();

    if (conflictingSubcategory) {
        throw new ApiError(
            409,
            `"${name}" is already a subcategory under ${conflictingSubcategory.category.name}. Use that instead of creating a main category.`,
        );
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

    const [subcategoryCount, linkedProducts] = await Promise.all([
        Subcategory.countDocuments({ category: id }),
        Product.countDocuments({ category: id }),
    ]);

    if (subcategoryCount > 0) {
        throw new ApiError(
            409,
            `Cannot delete category while ${subcategoryCount} subcategory(ies) exist. Remove them first.`,
        );
    }

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
