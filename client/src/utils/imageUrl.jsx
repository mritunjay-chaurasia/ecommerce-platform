const DEFAULT_PRODUCT_IMAGE = '/images/product-placeholder.svg';

const getAssetBaseUrl = () => {
    const apiUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';
    return apiUrl.replace(/\/api\/?$/, '');
};

const getImageUrl = (path) => {
    if (!path) {
        return '';
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    if (path.startsWith('/')) {
        return `${getAssetBaseUrl()}${path}`;
    }

    return `${getAssetBaseUrl()}/${path}`;
};

const getProductImageUrl = (path) => {
    const resolved = getImageUrl(path);
    return resolved || DEFAULT_PRODUCT_IMAGE;
};

export {
    DEFAULT_PRODUCT_IMAGE,
    getAssetBaseUrl,
    getImageUrl,
    getProductImageUrl,
};
