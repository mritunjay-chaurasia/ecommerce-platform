export const matchesCatalogRef = (item, value) => {
    if (!item || !value) {
        return false;
    }

    return item.id === value || item.slug === value;
};

export const buildCategoryBrowseUrl = (categorySlug) => (
    categorySlug ? `/?category=${encodeURIComponent(categorySlug)}` : '/'
);

export const buildSubcategoryBrowseUrl = (categorySlug, subcategorySlug) => (
    `/?category=${encodeURIComponent(categorySlug)}&subcategory=${encodeURIComponent(subcategorySlug)}`
);

export const isCategoryActive = (category, activeCategory) => (
    activeCategory !== 'all' && matchesCatalogRef(category, activeCategory)
);

export const isSubcategoryActive = (subcategory, activeSubcategory) => (
    Boolean(activeSubcategory) && matchesCatalogRef(subcategory, activeSubcategory)
);
