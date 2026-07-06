const Category = require('../models/category.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const escapeRegex = require('../utils/escapeRegex');
const buildUniqueSlug = require('../utils/buildUniqueSlug');
const { formatAdminProduct } = require('../utils/formatters/product');
const { LOW_STOCK_THRESHOLD } = require('../../../shared/constants/inventory');

const ensureCategoryExists = async (categoryId) => {
    const category = await Category.findById(categoryId).select('_id name');

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    return category;
};

const validatePriceRange = (price, salePrice) => {
    if (salePrice !== null && salePrice !== undefined && salePrice > price) {
        throw new ApiError(400, 'Sale price cannot be greater than price');
    }
};

const getProducts = async (req, res) => {
    const search = req.query.search?.trim();
    const filter = {};

    if (search) {
        const safeSearch = escapeRegex(search);
        filter.$or = [
            { name: { $regex: safeSearch, $options: 'i' } },
            { brand: { $regex: safeSearch, $options: 'i' } },
            { sku: { $regex: safeSearch, $options: 'i' } },
        ];
    }

    const products = await Product.find(filter)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        data: products.map(formatAdminProduct),
    });
};

const getInventoryProducts = async (req, res) => {
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();
    const category = req.query.category?.trim();
    const inventoryStatus = req.query.inventoryStatus?.trim();
    const filter = {};

    if (search) {
        const safeSearch = escapeRegex(search);
        filter.$or = [
            { name: { $regex: safeSearch, $options: 'i' } },
            { brand: { $regex: safeSearch, $options: 'i' } },
            { sku: { $regex: safeSearch, $options: 'i' } },
        ];
    }

    if (category) {
        filter.category = category;
    }

    if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive;
    }

    if (inventoryStatus === 'out_of_stock') {
        filter.stockQuantity = 0;
    } else if (inventoryStatus === 'low_stock') {
        filter.stockQuantity = { $gt: 0, $lte: LOW_STOCK_THRESHOLD };
    } else if (inventoryStatus === 'in_stock') {
        filter.stockQuantity = { $gt: LOW_STOCK_THRESHOLD };
    }

    const [products, total, totalProducts, inStockCount, lowStockCount, outOfStockCount] = await Promise.all([
        Product.find(filter)
            .populate('category', 'name slug')
            .sort({ stockQuantity: 1, updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments(filter),
        Product.countDocuments(),
        Product.countDocuments({ stockQuantity: { $gt: LOW_STOCK_THRESHOLD } }),
        Product.countDocuments({ stockQuantity: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } }),
        Product.countDocuments({ stockQuantity: 0 }),
    ]);

    return res.status(200).json({
        success: true,
        data: products.map(formatAdminProduct),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        summary: {
            totalProducts,
            inStockCount,
            lowStockCount,
            outOfStockCount,
            lowStockThreshold: LOW_STOCK_THRESHOLD,
        },
    });
};

const createProduct = async (req, res) => {
    const {
        name,
        description,
        category,
        brand,
        sku,
        price,
        salePrice,
        stockQuantity,
        imageUrls,
        isActive,
        isFeatured,
    } = req.body;

    await ensureCategoryExists(category);
    validatePriceRange(price, salePrice);

    const existingName = await Product.findOne({
        name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
    }).select('_id');

    if (existingName) {
        throw new ApiError(409, 'Product name already exists');
    }

    const normalizedSku = sku.trim().toUpperCase();
    const existingSku = await Product.findOne({ sku: normalizedSku }).select('_id');

    if (existingSku) {
        throw new ApiError(409, 'SKU already exists');
    }

    const slug = await buildUniqueSlug(Product, name, {
        emptyNameMessage: 'Product name must contain valid characters',
    });

    const product = await Product.create({
        name,
        slug,
        description: description || '',
        category,
        brand: brand || '',
        sku: normalizedSku,
        price,
        salePrice: salePrice ?? null,
        stockQuantity,
        imageUrls: imageUrls || [],
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
    });

    await product.populate('category', 'name slug');

    return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: formatAdminProduct(product),
    });
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    const nextPrice = req.body.price ?? product.price;
    const nextSalePrice = req.body.salePrice !== undefined ? req.body.salePrice : product.salePrice;

    if (req.body.category) {
        await ensureCategoryExists(req.body.category);
    }

    validatePriceRange(nextPrice, nextSalePrice);

    if (req.body.name && req.body.name.toLowerCase() !== product.name.toLowerCase()) {
        const existingName = await Product.findOne({
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${escapeRegex(req.body.name)}$`, 'i') },
        }).select('_id');

        if (existingName) {
            throw new ApiError(409, 'Product name already exists');
        }

        product.name = req.body.name;
        product.slug = await buildUniqueSlug(Product, req.body.name, {
            excludeId: id,
            emptyNameMessage: 'Product name must contain valid characters',
        });
    }

    if (req.body.sku) {
        const normalizedSku = req.body.sku.trim().toUpperCase();

        if (normalizedSku !== product.sku) {
            const existingSku = await Product.findOne({
                _id: { $ne: id },
                sku: normalizedSku,
            }).select('_id');

            if (existingSku) {
                throw new ApiError(409, 'SKU already exists');
            }
        }

        product.sku = normalizedSku;
    }

    if (req.body.description !== undefined) {
        product.description = req.body.description;
    }

    if (req.body.category !== undefined) {
        product.category = req.body.category;
    }

    if (req.body.brand !== undefined) {
        product.brand = req.body.brand;
    }

    if (req.body.price !== undefined) {
        product.price = req.body.price;
    }

    if (req.body.salePrice !== undefined) {
        product.salePrice = req.body.salePrice;
    }

    if (req.body.stockQuantity !== undefined) {
        product.stockQuantity = req.body.stockQuantity;
    }

    if (req.body.imageUrls !== undefined) {
        product.imageUrls = req.body.imageUrls;
    }

    if (req.body.isActive !== undefined) {
        product.isActive = req.body.isActive;
    }

    if (req.body.isFeatured !== undefined) {
        product.isFeatured = req.body.isFeatured;
    }

    await product.save();
    await product.populate('category', 'name slug');

    return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: formatAdminProduct(product),
    });
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    return res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
    });
};

const updateProductStock = async (req, res) => {
    const { id } = req.params;
    const { stockQuantity } = req.body;
    const product = await Product.findById(id);

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    product.stockQuantity = stockQuantity;
    await product.save();
    await product.populate('category', 'name slug');

    return res.status(200).json({
        success: true,
        message: 'Product stock updated successfully',
        data: formatAdminProduct(product),
    });
};

module.exports = {
    getProducts,
    getInventoryProducts,
    createProduct,
    updateProduct,
    updateProductStock,
    deleteProduct,
};
