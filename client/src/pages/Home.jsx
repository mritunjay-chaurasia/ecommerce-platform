import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getStoreBanners, getStoreProducts } from '../apis/store.api';
import VirtualizedProductGrid from '../components/store/VirtualizedProductGrid';
import { Loader, SelectField, showToastMessage, useToast } from '../components/ui';
import { SORT_OPTIONS } from '../constants/index';
import useThrottle from '../utils/useThrottle';
import { getImageUrl } from '../utils/imageUrl';
import './Home.css';

const FILTER_THROTTLE_MS = 350;

const Home = () => {
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [heroBanners, setHeroBanners] = useState([]);
    const [promoBanners, setPromoBanners] = useState([]);
    const [activeBannerIndex, setActiveBannerIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [minPriceInput, setMinPriceInput] = useState(searchParams.get('minPrice') || '');
    const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get('maxPrice') || '');

    const activeCategory = searchParams.get('category') || 'all';
    const searchQuery = searchParams.get('search')?.trim() || '';
    const activeSort = searchParams.get('sort') || 'newest';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const inStockOnly = searchParams.get('inStock') === 'true';

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const [productsResponse, featuredResponse] = await Promise.all([
                getStoreProducts({
                    search: searchQuery || undefined,
                    category: activeCategory === 'all' ? undefined : activeCategory,
                    sort: activeSort,
                    minPrice: minPrice || undefined,
                    maxPrice: maxPrice || undefined,
                    inStock: inStockOnly || undefined,
                }),
                getStoreProducts({ featured: true }),
            ]);

            setProducts(productsResponse.data || []);
            setFeaturedProducts(featuredResponse.data || []);
            setCategories(productsResponse.filters?.categories || []);
        } catch {
            setProducts([]);
            setFeaturedProducts([]);
            setCategories([]);
            showToastMessage(toast, 'Failed to load store products', 'error');
        } finally {
            setLoading(false);
        }
    }, [activeCategory, activeSort, inStockOnly, maxPrice, minPrice, searchQuery, toast]);

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
        fetchProducts();
        fetchBanners();
    }, [fetchBanners, fetchProducts]);

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

    const handleCategoryChange = useCallback((categoryId) => {
        throttledApplySearchParams((nextParams) => {
            if (categoryId === 'all') {
                nextParams.delete('category');
            } else {
                nextParams.set('category', categoryId);
            }
        });
    }, [throttledApplySearchParams]);

    const handleSortChange = (event) => {
        updateFilterParams({ sort: event.target.value === 'newest' ? undefined : event.target.value });
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
            ['sort', 'minPrice', 'maxPrice', 'inStock'].forEach((key) => nextParams.delete(key));
        });
    };

    const hasActiveFilters = activeSort !== 'newest' || minPrice || maxPrice || inStockOnly;

    const sectionTitle = useMemo(() => {
        if (searchQuery) {
            return `Search results for "${searchQuery}"`;
        }

        if (activeCategory !== 'all') {
            return categories.find((category) => category.id === activeCategory)?.name || 'Products';
        }

        return 'All Products';
    }, [activeCategory, categories, searchQuery]);

    const showFeaturedSection = !searchQuery
        && activeCategory === 'all'
        && featuredProducts.length > 0;

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

            {categories.length > 0 ? (
                <section className="store-section">
                    <div className="store-section-header">
                        <h2>Shop by Category</h2>
                    </div>
                    <div className="store-category-chips">
                        <button
                            type="button"
                            className={`store-category-chip${activeCategory === 'all' ? ' active' : ''}`}
                            onClick={() => handleCategoryChange('all')}
                        >
                            All
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                className={`store-category-chip${activeCategory === category.id ? ' active' : ''}`}
                                onClick={() => handleCategoryChange(category.id)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </section>
            ) : null}

            {showFeaturedSection ? (
                <section className="store-section">
                    <div className="store-section-header">
                        <h2>Featured Products</h2>
                        <span className="store-section-count">
                            {featuredProducts.length} items
                        </span>
                    </div>
                    <VirtualizedProductGrid products={featuredProducts} />
                </section>
            ) : null}

            <section className="store-section">
                <div className="store-section-header">
                    <h2>{sectionTitle}</h2>
                    <span className="store-section-count">
                        {products.length} items
                    </span>
                </div>

                <div className="store-filter-bar">
                    <SelectField
                        label="Sort by"
                        name="sort"
                        value={activeSort}
                        onChange={handleSortChange}
                        options={SORT_OPTIONS}
                        className="store-filter-sort"
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
                        <input
                            type="number"
                            min="0"
                            placeholder="Min price"
                            value={minPriceInput}
                            onChange={(event) => setMinPriceInput(event.target.value)}
                            className="store-filter-price-input"
                        />
                        <span>to</span>
                        <input
                            type="number"
                            min="0"
                            placeholder="Max price"
                            value={maxPriceInput}
                            onChange={(event) => setMaxPriceInput(event.target.value)}
                            className="store-filter-price-input"
                        />
                        <button type="button" className="store-filter-apply" onClick={handleApplyPriceFilter}>
                            Apply
                        </button>
                    </div>
                    {hasActiveFilters ? (
                        <button type="button" className="store-filter-clear" onClick={handleClearFilters}>
                            Clear filters
                        </button>
                    ) : null}
                </div>

                {loading ? (
                    <Loader center label="Loading products..." className="py-10" />
                ) : products.length > 0 ? (
                    <VirtualizedProductGrid products={products} />
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
