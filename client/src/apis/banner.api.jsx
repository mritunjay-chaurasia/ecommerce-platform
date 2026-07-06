import apiClients from './index';

const getBanners = async (params) => {
    const response = await apiClients.get('/admin/banners', { params });
    return response.data;
};

const createBanner = async (payload) => {
    const response = await apiClients.post('/admin/banners', payload);
    return response.data;
};

const updateBanner = async (id, payload) => {
    const response = await apiClients.put(`/admin/banners/${id}`, payload);
    return response.data;
};

const deleteBanner = async (id) => {
    const response = await apiClients.delete(`/admin/banners/${id}`);
    return response.data;
};

export {
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
};
