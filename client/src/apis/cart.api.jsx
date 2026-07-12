import apiClients from './index';

const getMyCart = async () => {
    const response = await apiClients.get('/cart/my');
    return response.data.data;
};

const addCartItem = async (payload) => {
    const response = await apiClients.post('/cart/items', payload);
    return response.data.data;
};

const updateCartItemQuantity = async (productId, quantity) => {
    const response = await apiClients.patch(`/cart/items/${productId}`, { quantity });
    return response.data.data;
};

const removeCartItem = async (productId) => {
    const response = await apiClients.delete(`/cart/items/${productId}`);
    return response.data.data;
};

const mergeCartItems = async (payload) => {
    const response = await apiClients.post('/cart/merge', payload);
    return response.data.data;
};

const clearCart = async () => {
    const response = await apiClients.delete('/cart');
    return response.data.data;
};

export {
    getMyCart,
    addCartItem,
    updateCartItemQuantity,
    removeCartItem,
    mergeCartItems,
    clearCart,
};
