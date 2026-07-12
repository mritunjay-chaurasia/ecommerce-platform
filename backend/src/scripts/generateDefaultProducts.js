const fs = require('fs');
const path = require('path');
const categoriesData = require('../data/default-categories.json');

const slugify = (value) => value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const PRODUCTS_PER_SUBCATEGORY = 4;

const priceByCategory = {
    Fashion: { min: 499, max: 4999 },
    Electronics: { min: 999, max: 149999 },
    'Home & Kitchen': { min: 299, max: 24999 },
    'Beauty & Personal Care': { min: 149, max: 4999 },
    Grocery: { min: 49, max: 999 },
    'Health & Wellness': { min: 199, max: 7999 },
    'Sports & Outdoors': { min: 399, max: 19999 },
    'Books & Stationery': { min: 99, max: 2999 },
    'Toys & Baby Products': { min: 199, max: 9999 },
    Automotive: { min: 299, max: 14999 },
    'Pet Supplies': { min: 199, max: 4999 },
    'Jewelry & Accessories': { min: 499, max: 99999 },
    Furniture: { min: 2999, max: 89999 },
    Appliances: { min: 4999, max: 99999 },
    'Office & Industrial': { min: 299, max: 49999 },
    Gaming: { min: 999, max: 199999 },
    'Music & Entertainment': { min: 299, max: 49999 },
    Gifts: { min: 199, max: 9999 },
    'Digital Products': { min: 99, max: 9999 },
    'Travel & Luggage': { min: 699, max: 14999 },
    Jewelry: { min: 999, max: 199999 },
    'Kids & Baby': { min: 199, max: 9999 },
    'Garden & Outdoor': { min: 199, max: 24999 },
    'Tools & Hardware': { min: 299, max: 19999 },
    'Arts & Crafts': { min: 99, max: 4999 },
    'Luxury Products': { min: 9999, max: 499999 },
    'Mobile Accessories': { min: 149, max: 4999 },
    'Computer Accessories': { min: 399, max: 29999 },
    'Smart Home': { min: 999, max: 49999 },
    'Medical Supplies': { min: 199, max: 9999 },
    'Seasonal & Festive': { min: 149, max: 4999 },
};

const brands = ['ShopKart Basics', 'UrbanChoice', 'DailyEssentials', 'PrimeSelect', 'ValueMart', 'NovaLine', 'CraftHub'];
const variants = ['Essentials', 'Premium Pick', 'Pro Series', 'Value Pack'];

const buildSku = (categoryName, subcategoryName, variantIndex) => {
    const categoryPart = slugify(categoryName).replace(/-/g, '').slice(0, 5).toUpperCase();
    const subPart = slugify(subcategoryName).replace(/-/g, '').slice(0, 6).toUpperCase();
    return `SK-${categoryPart}-${subPart}-${String(variantIndex + 1).padStart(2, '0')}`;
};

const products = [];
let index = 0;

for (const category of categoriesData.categories) {
    const range = priceByCategory[category.name] || { min: 199, max: 9999 };

    for (const subcategory of category.subcategories) {
        for (let variantIndex = 0; variantIndex < PRODUCTS_PER_SUBCATEGORY; variantIndex += 1) {
            index += 1;
            const spread = range.max - range.min;
            const basePrice = range.min + ((index * 137) % spread);
            const price = basePrice + (variantIndex * Math.max(99, Math.round(spread * 0.08)));
            const salePrice = (index + variantIndex) % 3 === 0
                ? Math.max(range.min, Math.round(price * 0.88))
                : null;

            products.push({
                category: category.name,
                subcategory,
                name: `${subcategory} ${variants[variantIndex]}`,
                brand: brands[(index + variantIndex) % brands.length],
                sku: buildSku(category.name, subcategory, variantIndex),
                price,
                salePrice,
                stockQuantity: 15 + ((index + variantIndex * 11) % 85),
                description: `${variants[variantIndex]} ${subcategory.toLowerCase()} product under ${category.name}. Useful for storefront category and subcategory filters.`,
                isFeatured: index <= 12 && variantIndex === 0,
                isActive: true,
                imageUrls: [],
            });
        }
    }
}

const outputPath = path.join(__dirname, '../data/default-products.json');
fs.writeFileSync(outputPath, `${JSON.stringify({ products }, null, 2)}\n`);

console.log(
    `Generated ${products.length} products `
    + `(${PRODUCTS_PER_SUBCATEGORY} per subcategory, ${categoriesData.categories.length} categories)`,
);
