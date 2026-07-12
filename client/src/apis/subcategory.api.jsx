import apiClients from './index';

const getSubcategories = async (params) => {
    const response = await apiClients.get('/admin/subcategories', { params });
    return response.data;
};

const createSubcategory = async (payload) => {
    const response = await apiClients.post('/admin/subcategories', payload);
    return response.data;
};

const updateSubcategory = async (id, payload) => {
    const response = await apiClients.put(`/admin/subcategories/${id}`, payload);
    return response.data;
};

const deleteSubcategory = async (id) => {
    const response = await apiClients.delete(`/admin/subcategories/${id}`);
    return response.data;
};

export {
    getSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
};
