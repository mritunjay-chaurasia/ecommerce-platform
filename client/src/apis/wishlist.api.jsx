import apiClients from './index';

const getMyWishlist = async () => {
    const response = await apiClients.get('/wishlist/my');
    return response.data.data;
};

const toggleWishlistProduct = async (productId) => {
    const response = await apiClients.post('/wishlist/toggle', { productId });
    return response.data;
};

const removeWishlistProduct = async (productId) => {
    const response = await apiClients.delete(`/wishlist/${productId}`);
    return response.data;
};

export {
    getMyWishlist,
    toggleWishlistProduct,
    removeWishlistProduct,
};
