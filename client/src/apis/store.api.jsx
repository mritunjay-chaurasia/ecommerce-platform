import apiClients from './index';

const getCheckoutSummary = async (payload) => {
    const response = await apiClients.post('/checkout/summary', payload);
    return response.data.data;
};

const createOrder = async (payload) => {
    const response = await apiClients.post('/orders', payload);
    return response.data;
};

const getOrderInvoiceUrl = (orderId) => `${process.env.REACT_APP_BACKEND_URL}/orders/${orderId}/invoice`;

const getMyOrders = async () => {
    const response = await apiClients.get('/orders/my');
    return response.data.data;
};

const getMyOrder = async (orderId) => {
    const response = await apiClients.get(`/orders/${orderId}`);
    return response.data.data;
};

const getStoreBanners = async (params) => {
    const response = await apiClients.get('/banners', { params });
    return response.data;
};

const getStoreSettings = async () => {
    const response = await apiClients.get('/settings');
    return response.data.data;
};

const getRelatedProducts = async (productId) => {
    const response = await apiClients.get(`/products/${productId}/related`);
    return response.data.data;
};

const cancelMyOrder = async (orderId, payload = {}) => {
    const response = await apiClients.patch(`/orders/${orderId}/cancel`, payload);
    return response.data;
};

const getStoreCategories = async () => {
    const response = await apiClients.get('/categories');
    return response.data.data;
};

const getStoreBrands = async () => {
    const response = await apiClients.get('/brands');
    return response.data.data;
};

const getStoreProducts = async (params) => {
    const response = await apiClients.get('/products', { params });
    return response.data;
};

const getStoreProduct = async (productId) => {
    const response = await apiClients.get(`/products/${productId}`);
    return response.data.data;
};

const getProductReviews = async (productId) => {
    const response = await apiClients.get(`/reviews/product/${productId}`);
    return response.data.data;
};

const getMyProductReview = async (productId) => {
    const response = await apiClients.get('/reviews/my', { params: { productId } });
    return response.data.data;
};

const submitProductReview = async (payload) => {
    const response = await apiClients.post('/reviews', payload);
    return response.data;
};

export {
    getStoreCategories,
    getStoreBrands,
    getStoreProducts,
    getStoreProduct,
    getProductReviews,
    getMyProductReview,
    submitProductReview,
    getCheckoutSummary,
    createOrder,
    getOrderInvoiceUrl,
    getMyOrders,
    getMyOrder,
    cancelMyOrder,
    getRelatedProducts,
    getStoreBanners,
    getStoreSettings,
};
