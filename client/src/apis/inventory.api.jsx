import apiClients from './index';

const getInventoryProducts = async (params) => {
    const response = await apiClients.get('/admin/inventory', { params });
    return response.data;
};

const updateProductStock = async (id, payload) => {
    const response = await apiClients.patch(`/admin/products/${id}/stock`, payload);
    return response.data;
};

export {
    getInventoryProducts,
    updateProductStock,
};
