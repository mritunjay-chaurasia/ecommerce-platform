import apiClients from './index';

const getProducts = async (params) => {
    const response = await apiClients.get('/admin/products', { params });
    return response.data.data;
};

const createProduct = async (payload) => {
    const response = await apiClients.post('/admin/products', payload);
    return response.data;
};

const updateProduct = async (id, payload) => {
    const response = await apiClients.put(`/admin/products/${id}`, payload);
    return response.data;
};

const deleteProduct = async (id) => {
    const response = await apiClients.delete(`/admin/products/${id}`);
    return response.data;
};

export {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
};
