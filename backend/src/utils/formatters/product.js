const { getEffectivePrice } = require('../../../../shared/utils/pricing');
const { getInventoryStatus } = require('../../../../shared/constants/inventory');

const formatStoreProduct = (product, reviewStats = {}) => {
    const originalPrice = product.price;
    const currentPrice = getEffectivePrice(product);
    const stats = reviewStats[String(product._id)];

    return {
        id: String(product._id),
        name: product.name,
        slug: product.slug,
        description: product.description,
        category: product.category?._id ? String(product.category._id) : String(product.category),
        categoryName: product.category?.name || '',
        subcategory: product.subcategory?._id ? String(product.subcategory._id) : (product.subcategory ? String(product.subcategory) : null),
        subcategoryName: product.subcategory?.name || '',
        brand: product.brand,
        sku: product.sku,
        price: originalPrice,
        salePrice: product.salePrice,
        currentPrice,
        stockQuantity: product.stockQuantity,
        imageUrl: product.imageUrls?.[0] || '',
        imageUrls: product.imageUrls || [],
        isFeatured: product.isFeatured,
        avgRating: stats?.avgRating ?? null,
        reviewCount: stats?.reviewCount ?? 0,
    };
};

const formatAdminProduct = (product) => ({
    id: product._id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category?._id || product.category,
    categoryName: product.category?.name || '',
    subcategory: product.subcategory?._id || product.subcategory || null,
    subcategoryName: product.subcategory?.name || '',
    brand: product.brand,
    sku: product.sku,
    price: product.price,
    salePrice: product.salePrice,
    stockQuantity: product.stockQuantity,
    inventoryStatus: getInventoryStatus(product.stockQuantity),
    imageUrls: product.imageUrls || [],
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
});

module.exports = {
    formatStoreProduct,
    formatAdminProduct,
};
