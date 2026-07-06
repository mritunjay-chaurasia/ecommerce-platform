import apiClients from './index';

const getCoupons = async (params) => {
    const response = await apiClients.get('/admin/coupons', { params });
    return response.data;
};

const createCoupon = async (payload) => {
    const response = await apiClients.post('/admin/coupons', payload);
    return response.data;
};

const updateCoupon = async (id, payload) => {
    const response = await apiClients.put(`/admin/coupons/${id}`, payload);
    return response.data;
};

const deleteCoupon = async (id) => {
    const response = await apiClients.delete(`/admin/coupons/${id}`);
    return response.data;
};

export {
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
};
