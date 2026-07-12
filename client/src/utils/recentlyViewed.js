const RECENTLY_VIEWED_KEY = 'ecommerce_recently_viewed';
const MAX_RECENTLY_VIEWED = 12;

const getRecentlyViewedIds = () => {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);

        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);

        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
        return [];
    }
};

const saveRecentlyViewedIds = (ids) => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids));
};

const trackRecentlyViewedProduct = (productId) => {
    if (!productId) {
        return;
    }

    const normalizedId = String(productId);
    const currentIds = getRecentlyViewedIds().filter((id) => id !== normalizedId);
    const nextIds = [normalizedId, ...currentIds].slice(0, MAX_RECENTLY_VIEWED);

    saveRecentlyViewedIds(nextIds);
};

export {
    getRecentlyViewedIds,
    trackRecentlyViewedProduct,
    MAX_RECENTLY_VIEWED,
};
