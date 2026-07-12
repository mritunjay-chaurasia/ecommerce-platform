const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const Product = require('../models/product.model');
const buildUniqueSlug = require('../utils/buildUniqueSlug');
const defaultProducts = require('../data/default-products.json');

const isDuplicateKeyError = (error) => error?.code === 11000;

const resolveCategoryAndSubcategory = async (categoryName, subcategoryName) => {
    const category = await Category.findOne({ name: categoryName }).select('_id name');

    if (!category) {
        return { error: `Category not found: ${categoryName}` };
    }

    const subcategory = await Subcategory.findOne({
        category: category._id,
        name: subcategoryName,
    }).select('_id name category');

    if (!subcategory) {
        return { error: `Subcategory not found: ${subcategoryName} (${categoryName})` };
    }

    return { category, subcategory };
};

const findOrCreateProduct = async (entry) => {
    const normalizedSku = entry.sku.trim().toUpperCase();
    const existingBySku = await Product.findOne({ sku: normalizedSku }).select('_id sku name');

    if (existingBySku) {
        return { created: false, reason: 'sku' };
    }

    const existingByName = await Product.findOne({
        name: { $regex: new RegExp(`^${entry.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    }).select('_id name');

    if (existingByName) {
        return { created: false, reason: 'name' };
    }

    const resolved = await resolveCategoryAndSubcategory(entry.category, entry.subcategory);

    if (resolved.error) {
        return { created: false, reason: 'missing', error: resolved.error };
    }

    const { category, subcategory } = resolved;
    const salePrice = entry.salePrice ?? null;
    const price = entry.price;

    if (salePrice !== null && salePrice > price) {
        return { created: false, reason: 'invalid', error: `Sale price exceeds price for ${entry.name}` };
    }

    const slug = await buildUniqueSlug(Product, entry.name, {
        emptyNameMessage: 'Product name must contain valid characters',
    });

    try {
        await Product.create({
            name: entry.name,
            slug,
            description: entry.description || '',
            category: category._id,
            subcategory: subcategory._id,
            brand: entry.brand || '',
            sku: normalizedSku,
            price,
            salePrice,
            stockQuantity: entry.stockQuantity ?? 0,
            imageUrls: entry.imageUrls || [],
            isActive: entry.isActive ?? true,
            isFeatured: entry.isFeatured ?? false,
        });

        return { created: true };
    } catch (error) {
        if (!isDuplicateKeyError(error)) {
            throw error;
        }

        const duplicate = await Product.findOne({ sku: normalizedSku }).select('_id');

        if (duplicate) {
            return { created: false, reason: 'sku' };
        }

        throw error;
    }
};

const seedDefaultProducts = async () => {
    const stats = {
        productsCreated: 0,
        productsSkipped: 0,
        missingReferences: 0,
        invalidEntries: 0,
    };

    for (const entry of defaultProducts.products) {
        const result = await findOrCreateProduct(entry);

        if (result.created) {
            stats.productsCreated += 1;
            continue;
        }

        if (result.reason === 'missing') {
            stats.missingReferences += 1;
            console.warn(`Product seed skipped: ${result.error}`);
        } else if (result.reason === 'invalid') {
            stats.invalidEntries += 1;
            console.warn(`Product seed skipped: ${result.error}`);
        } else {
            stats.productsSkipped += 1;
        }
    }

    if (stats.productsCreated > 0) {
        console.log(
            `Product seed: ${stats.productsCreated} products created `
            + `(${stats.productsSkipped} skipped, ${stats.missingReferences} missing refs, `
            + `${stats.invalidEntries} invalid)`,
        );
    }

    return stats;
};

module.exports = seedDefaultProducts;
