import apiClients from './index';

const getCategories = async (params) => {
    const response = await apiClients.get('/admin/categories', { params });
    return response.data;
};

const createCategory = async (payload) => {
    const response = await apiClients.post('/admin/categories', payload);
    return response.data;
};

const updateCategory = async (id, payload) => {
    const response = await apiClients.put(`/admin/categories/${id}`, payload);
    return response.data;
};

const deleteCategory = async (id) => {
    const response = await apiClients.delete(`/admin/categories/${id}`);
    return response.data;
};

export {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
