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

export {
    getAssetBaseUrl,
    getImageUrl,
};
