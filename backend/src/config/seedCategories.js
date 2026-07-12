const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const buildUniqueSlug = require('../utils/buildUniqueSlug');
const defaultCategories = require('../data/default-categories.json');

const isDuplicateKeyError = (error) => error?.code === 11000;

const findOrCreateCategory = async (name) => {
    const existing = await Category.findOne({ name }).select('_id name slug');

    if (existing) {
        return { category: existing, created: false };
    }

    const slug = await buildUniqueSlug(Category, name, {
        emptyNameMessage: 'Category name must contain valid characters',
    });

    try {
        const category = await Category.create({
            name,
            slug,
            description: '',
            isActive: true,
        });

        return { category, created: true };
    } catch (error) {
        if (!isDuplicateKeyError(error)) {
            throw error;
        }

        const category = await Category.findOne({ name }).select('_id name slug');

        if (!category) {
            throw error;
        }

        return { category, created: false };
    }
};

const findOrCreateSubcategory = async (name, categoryId) => {
    const existing = await Subcategory.findOne({
        category: categoryId,
        name,
    }).select('_id name slug category');

    if (existing) {
        return { created: false };
    }

    const slug = await buildUniqueSlug(Subcategory, name, {
        emptyNameMessage: 'Subcategory name must contain valid characters',
    });

    try {
        await Subcategory.create({
            name,
            slug,
            category: categoryId,
            description: '',
            isActive: true,
        });

        return { created: true };
    } catch (error) {
        if (!isDuplicateKeyError(error)) {
            throw error;
        }

        const duplicate = await Subcategory.findOne({
            category: categoryId,
            name,
        }).select('_id');

        if (duplicate) {
            return { created: false };
        }

        throw error;
    }
};

const seedDefaultCategories = async () => {
    const stats = {
        categoriesCreated: 0,
        categoriesSkipped: 0,
        subcategoriesCreated: 0,
        subcategoriesSkipped: 0,
    };

    for (const entry of defaultCategories.categories) {
        const { category, created: categoryCreated } = await findOrCreateCategory(entry.name);

        if (categoryCreated) {
            stats.categoriesCreated += 1;
        } else {
            stats.categoriesSkipped += 1;
        }

        for (const subcategoryName of entry.subcategories) {
            const { created: subcategoryCreated } = await findOrCreateSubcategory(
                subcategoryName,
                category._id,
            );

            if (subcategoryCreated) {
                stats.subcategoriesCreated += 1;
            } else {
                stats.subcategoriesSkipped += 1;
            }
        }
    }

    if (stats.categoriesCreated > 0 || stats.subcategoriesCreated > 0) {
        console.log(
            `Category seed: ${stats.categoriesCreated} categories and `
            + `${stats.subcategoriesCreated} subcategories created `
            + `(${stats.categoriesSkipped} categories, ${stats.subcategoriesSkipped} subcategories skipped)`,
        );
    }

    return stats;
};

module.exports = seedDefaultCategories;
