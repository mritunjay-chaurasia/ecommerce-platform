import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getStoreBanners, getStoreBrands, getStoreCategories, getStoreProducts } from '../apis/store.api';
import ProductGrid from '../components/store/ProductGrid';
import { Loader, SelectField, showToastMessage, useToast } from '../components/ui';
import { SORT_OPTIONS } from '../constants/index';
import useThrottle from '../utils/useThrottle';
import { getImageUrl } from '../utils/imageUrl';
import {
    buildCategoryBrowseUrl,
    isCategoryActive,
    isSubcategoryActive,
} from '../utils/storeCategory';
import { getRecentlyViewedIds } from '../utils/recentlyViewed';
import './Home.css';

const FILTER_THROTTLE_MS = 350;
const PRODUCTS_PAGE_SIZE = 12;

const Home = () => {
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
    const [heroBanners, setHeroBanners] = useState([]);
    const [promoBanners, setPromoBanners] = useState([]);
    const [activeBannerIndex, setActiveBannerIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const loadMoreRef = useRef(null);
    const isFetchingRef = useRef(false);
    const [minPriceInput, setMinPriceInput] = useState(searchParams.get('minPrice') || '');
    const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get('maxPrice') || '');

    const activeCategory = searchParams.get('category') || 'all';
    const activeSubcategory = searchParams.get('subcategory') || '';
    const searchQuery = searchParams.get('search')?.trim() || '';
    const activeSort = searchParams.get('sort') || 'newest';
    const activeBrand = searchParams.get('brand') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const inStockOnly = searchParams.get('inStock') === 'true';

    const productQuery = useMemo(() => ({
        search: searchQuery || undefined,
        category: activeSubcategory ? undefined : (activeCategory === 'all' ? undefined : activeCategory),
        subcategory: activeSubcategory || undefined,
        brand: activeBrand || undefined,
        sort: activeSort,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        inStock: inStockOnly || undefined,
        limit: PRODUCTS_PAGE_SIZE,
    }), [
        activeCategory,
        activeSubcategory,
        activeBrand,
        activeSort,
        inStockOnly,
        maxPrice,
        minPrice,
        searchQuery,
    ]);

    const fetchProductsPage = useCallback(async (pageNumber, append = false) => {
        if (isFetchingRef.current) {
            return;
        }

        isFetchingRef.current = true;

        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await getStoreProducts({
                ...productQuery,
                page: pageNumber,
            });

            const nextProducts = response.data || [];
            const pagination = response.pagination;
            const totalPages = pagination?.totalPages ?? 1;

            setProducts((current) => (append ? [...current, ...nextProducts] : nextProducts));
            setPage(pageNumber);
            setHasMore(pageNumber < totalPages);
        } catch {
            if (!append) {
                setProducts([]);
            }
            setHasMore(false);
            showToastMessage(toast, 'Failed to load store products', 'error');
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
            setLoadingMore(false);
        }
    }, [productQuery, toast]);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await getStoreCategories();
            setCategories(data || []);
        } catch {
            setCategories([]);
        }
    }, []);

    const fetchBrands = useCallback(async () => {
        try {
            const data = await getStoreBrands();
            setBrands(data || []);
        } catch {
            setBrands([]);
        }
    }, []);

    const fetchRecentlyViewed = useCallback(async () => {
        const recentlyViewedIds = getRecentlyViewedIds();

        if (recentlyViewedIds.length === 0) {
            setRecentlyViewedProducts([]);
            return;
        }

        try {
            const response = await getStoreProducts({ ids: recentlyViewedIds.join(',') });
            const productsById = new Map((response.data || []).map((product) => [product.id, product]));
            setRecentlyViewedProducts(
                recentlyViewedIds
                    .map((id) => productsById.get(id))
                    .filter(Boolean),
            );
        } catch {
            setRecentlyViewedProducts([]);
        }
    }, []);

    const fetchBanners = useCallback(async () => {
        try {
            const [heroResponse, promoResponse] = await Promise.all([
                getStoreBanners({ placement: 'hero' }),
                getStoreBanners({ placement: 'promo' }),
            ]);
            setHeroBanners(heroResponse.data || []);
            setPromoBanners(promoResponse.data || []);
            setActiveBannerIndex(0);
        } catch {
            setHeroBanners([]);
            setPromoBanners([]);
        }
    }, []);

    useEffect(() => {
        setHasMore(true);
        setPage(1);
        fetchProductsPage(1, false);
    }, [fetchProductsPage]);

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    useEffect(() => {
        fetchRecentlyViewed();
    }, [fetchRecentlyViewed]);

    useEffect(() => {
        const target = loadMoreRef.current;

        if (!target || !hasMore || loading || loadingMore) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    fetchProductsPage(page + 1, true);
                }
            },
            { root: null, rootMargin: '240px 0px', threshold: 0.1 },
        );

        observer.observe(target);

        return () => observer.disconnect();
    }, [fetchProductsPage, hasMore, loading, loadingMore, page]);

    useEffect(() => {
        if (heroBanners.length <= 1) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            setActiveBannerIndex((current) => (current + 1) % heroBanners.length);
        }, 6000);

        return () => window.clearInterval(timer);
    }, [heroBanners.length]);

    const applySearchParams = useCallback((mutateParams) => {
        const nextParams = new URLSearchParams(searchParams);
        mutateParams(nextParams);
        setSearchParams(nextParams);
    }, [searchParams, setSearchParams]);

    const throttledApplySearchParams = useThrottle(applySearchParams, FILTER_THROTTLE_MS);

    const updateFilterParams = useCallback((updates) => {
        throttledApplySearchParams((nextParams) => {
            Object.entries(updates).forEach(([key, value]) => {
                if (value === undefined || value === null || value === '' || value === false) {
                    nextParams.delete(key);
                } else {
                    nextParams.set(key, String(value));
                }
            });
        });
    }, [throttledApplySearchParams]);

    const handleCategoryChange = useCallback((categorySlug) => {
        throttledApplySearchParams((nextParams) => {
            nextParams.delete('subcategory');

            if (categorySlug === 'all') {
                nextParams.delete('category');
            } else {
                nextParams.set('category', categorySlug);
            }
        });
    }, [throttledApplySearchParams]);

    const handleSubcategoryChange = useCallback((subcategorySlug, categorySlug) => {
        throttledApplySearchParams((nextParams) => {
            if (!subcategorySlug) {
                nextParams.delete('subcategory');
                return;
            }

            if (categorySlug) {
                nextParams.set('category', categorySlug);
            }

            nextParams.set('subcategory', subcategorySlug);
        });
    }, [throttledApplySearchParams]);

    const handleSortChange = (event) => {
        updateFilterParams({ sort: event.target.value === 'newest' ? undefined : event.target.value });
    };

    const handleBrandChange = (event) => {
        updateFilterParams({ brand: event.target.value || undefined });
    };

    const handleInStockToggle = (event) => {
        updateFilterParams({ inStock: event.target.checked ? 'true' : undefined });
    };

    const throttledApplyPriceFilter = useThrottle(() => {
        updateFilterParams({
            minPrice: minPriceInput.trim() || undefined,
            maxPrice: maxPriceInput.trim() || undefined,
        });
    }, FILTER_THROTTLE_MS);

    const handleApplyPriceFilter = () => {
        throttledApplyPriceFilter();
    };

    const handleClearFilters = () => {
        setMinPriceInput('');
        setMaxPriceInput('');
        throttledApplySearchParams((nextParams) => {
            ['sort', 'brand', 'minPrice', 'maxPrice', 'inStock'].forEach((key) => nextParams.delete(key));
        });
    };

    const hasActiveFilters = activeSort !== 'newest' || activeBrand || minPrice || maxPrice || inStockOnly;

    const activeCategoryMeta = useMemo(
        () => categories.find((category) => isCategoryActive(category, activeCategory)),
        [activeCategory, categories],
    );

    const activeSubcategoryMeta = useMemo(
        () => activeCategoryMeta?.subcategories?.find(
            (subcategory) => isSubcategoryActive(subcategory, activeSubcategory),
        ),
        [activeCategoryMeta, activeSubcategory],
    );

    const visibleSubcategories = activeCategoryMeta?.subcategories || [];

    const categoryOptions = useMemo(
        () => categories.map((category) => ({
            value: category.slug,
            label: category.name,
        })),
        [categories],
    );

    const subcategoryOptions = useMemo(
        () => visibleSubcategories.map((subcategory) => ({
            value: subcategory.slug,
            label: subcategory.name,
        })),
        [visibleSubcategories],
    );

    const brandOptions = useMemo(
        () => brands.map((brand) => ({
            value: brand,
            label: brand,
        })),
        [brands],
    );

    const categorySelectValue = activeCategory === 'all'
        ? ''
        : (activeCategoryMeta?.slug || activeCategory);

    const subcategorySelectValue = activeSubcategoryMeta?.slug || activeSubcategory || '';

    const handleCategorySelectChange = (event) => {
        handleCategoryChange(event.target.value || 'all');
    };

    const handleSubcategorySelectChange = (event) => {
        handleSubcategoryChange(event.target.value, activeCategoryMeta?.slug);
    };

    const sectionTitle = useMemo(() => {
        if (searchQuery) {
            return `Search results for "${searchQuery}"`;
        }

        if (activeSubcategoryMeta) {
            return activeSubcategoryMeta.name;
        }

        if (activeCategory !== 'all') {
            return activeCategoryMeta?.name || 'Products';
        }

        return 'All Products';
    }, [activeCategory, activeCategoryMeta, activeSubcategoryMeta, searchQuery]);

    const currentHero = heroBanners[activeBannerIndex];

    return (
        <div className="store-home">
            {currentHero ? (
                <section className="store-hero">
                    {currentHero.imageUrl ? (
                        <>
                            <img
                                key={currentHero.id}
                                src={getImageUrl(currentHero.imageUrl)}
                                alt=""
                                className="store-hero-image"
                            />
                            <div className="store-hero-overlay" aria-hidden="true" />
                        </>
                    ) : null}
                    <div className="store-hero-content">
                        {currentHero.tag ? <p className="store-hero-tag">{currentHero.tag}</p> : null}
                        <h1 className="store-hero-title">{currentHero.title}</h1>
                        {currentHero.subtitle ? (
                            <p className="store-hero-subtitle">{currentHero.subtitle}</p>
                        ) : null}
                    </div>

                    {heroBanners.length > 1 ? (
                        <div className="store-hero-dots">
                            {heroBanners.map((banner, index) => (
                                <button
                                    key={banner.id}
                                    type="button"
                                    className={`store-hero-dot${index === activeBannerIndex ? ' active' : ''}`}
                                    onClick={() => setActiveBannerIndex(index)}
                                    aria-label={`Show banner ${index + 1}`}
                                />
                            ))}
                        </div>
                    ) : null}
                </section>
            ) : null}

            {promoBanners.length > 0 ? (
                <section className="store-section">
                    <div className="store-section-header">
                        <h2>Offers & Promotions</h2>
                        <span className="store-section-count">
                            {promoBanners.length} active
                        </span>
                    </div>
                    <div className="store-promo-grid">
                        {promoBanners.map((banner) => (
                            <article key={banner.id} className="store-promo-card">
                                {banner.imageUrl ? (
                                    <>
                                        <img
                                            src={getImageUrl(banner.imageUrl)}
                                            alt=""
                                            className="store-promo-card-image"
                                        />
                                        <div className="store-promo-card-overlay" aria-hidden="true" />
                                    </>
                                ) : null}
                                <div className="store-promo-card-content">
                                    {banner.tag ? <p className="store-promo-tag">{banner.tag}</p> : null}
                                    <h3 className="store-promo-title">{banner.title}</h3>
                                    {banner.subtitle ? (
                                        <p className="store-promo-subtitle">{banner.subtitle}</p>
                                    ) : null}
                                    {banner.buttonText ? (
                                        <span className="store-promo-button">{banner.buttonText}</span>
                                    ) : null}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            ) : null}

            {recentlyViewedProducts.length > 0 ? (
                <section className="store-section">
                    <div className="store-section-header">
                        <h2>Recently Viewed</h2>
                        <span className="store-section-count">
                            {recentlyViewedProducts.length} item{recentlyViewedProducts.length === 1 ? '' : 's'}
                        </span>
                    </div>
                    <ProductGrid products={recentlyViewedProducts} />
                </section>
            ) : null}

            <section className="store-section">
                {(activeCategoryMeta || activeSubcategoryMeta) ? (
                    <nav className="store-breadcrumbs" aria-label="Breadcrumb">
                        <Link to="/">Home</Link>
                        {activeCategoryMeta ? (
                            <>
                                <span aria-hidden="true">/</span>
                                {activeSubcategoryMeta ? (
                                    <Link to={buildCategoryBrowseUrl(activeCategoryMeta.slug)}>
                                        {activeCategoryMeta.name}
                                    </Link>
                                ) : (
                                    <span>{activeCategoryMeta.name}</span>
                                )}
                            </>
                        ) : null}
                        {activeSubcategoryMeta ? (
                            <>
                                <span aria-hidden="true">/</span>
                                <span>{activeSubcategoryMeta.name}</span>
                            </>
                        ) : null}
                    </nav>
                ) : null}

                <div className="store-section-header">
                    <div>
                        <h2>{sectionTitle}</h2>
                        {activeSubcategoryMeta?.description || activeCategoryMeta?.description ? (
                            <p className="store-section-subtitle">
                                {activeSubcategoryMeta?.description || activeCategoryMeta?.description}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="store-filter-bar">
                    {categories.length > 0 ? (
                        <>
                            <SelectField
                                label="Category"
                                name="categoryFilter"
                                value={categorySelectValue}
                                onChange={handleCategorySelectChange}
                                options={categoryOptions}
                                placeholder="All categories"
                                className="store-filter-field store-filter-category"
                            />
                            <SelectField
                                label="Subcategory"
                                name="subcategoryFilter"
                                value={subcategorySelectValue}
                                onChange={handleSubcategorySelectChange}
                                options={subcategoryOptions}
                                placeholder={
                                    activeCategoryMeta
                                        ? (subcategoryOptions.length > 0
                                            ? `All ${activeCategoryMeta.name}`
                                            : 'No subcategories')
                                        : 'Select category first'
                                }
                                disabled={!activeCategoryMeta || subcategoryOptions.length === 0}
                                className="store-filter-field store-filter-subcategory"
                            />
                            <div className="store-filter-divider" aria-hidden="true" />
                        </>
                    ) : null}
                    {brands.length > 0 ? (
                        <SelectField
                            label="Brand"
                            name="brandFilter"
                            value={activeBrand}
                            onChange={handleBrandChange}
                            options={brandOptions}
                            placeholder="All brands"
                            className="store-filter-field store-filter-brand"
                        />
                    ) : null}
                    <SelectField
                        label="Sort by"
                        name="sort"
                        value={activeSort}
                        onChange={handleSortChange}
                        options={SORT_OPTIONS}
                        className="store-filter-field store-filter-sort"
                    />
                    <label className="store-checkbox-label store-filter-checkbox">
                        <input
                            type="checkbox"
                            checked={inStockOnly}
                            onChange={handleInStockToggle}
                        />
                        In stock only
                    </label>
                    <div className="store-filter-price">
                        <span className="store-filter-price-label">Price</span>
                        <input
                            type="number"
                            min="0"
                            placeholder="Min"
                            value={minPriceInput}
                            onChange={(event) => setMinPriceInput(event.target.value)}
                            className="store-filter-price-input"
                            aria-label="Minimum price"
                        />
                        <span className="store-filter-price-separator">–</span>
                        <input
                            type="number"
                            min="0"
                            placeholder="Max"
                            value={maxPriceInput}
                            onChange={(event) => setMaxPriceInput(event.target.value)}
                            className="store-filter-price-input"
                            aria-label="Maximum price"
                        />
                        <button type="button" className="store-filter-apply-btn" onClick={handleApplyPriceFilter}>
                            Apply
                        </button>
                    </div>
                    {hasActiveFilters ? (
                        <button type="button" className="store-filter-clear-btn" onClick={handleClearFilters}>
                            Clear
                        </button>
                    ) : null}
                </div>

                {loading && products.length === 0 ? (
                    <Loader center label="Loading products..." className="store-products-loader" />
                ) : products.length > 0 ? (
                    <>
                        <ProductGrid products={products} />
                        {hasMore ? (
                            <div ref={loadMoreRef} className="store-products-load-more" aria-hidden={!loadingMore}>
                                {loadingMore ? (
                                    <Loader center label="Loading more products..." />
                                ) : null}
                            </div>
                        ) : null}
                    </>
                ) : (
                    <p className="store-empty-state">
                        No products found for the selected filters.
                    </p>
                )}
            </section>
        </div>
    );
};

export default Home;
