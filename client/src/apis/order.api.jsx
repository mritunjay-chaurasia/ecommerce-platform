import apiClients from './index';

const getOrders = async (params) => {
    const response = await apiClients.get('/admin/orders', { params });
    return response.data;
};

const getOrderById = async (id) => {
    const response = await apiClients.get(`/admin/orders/${id}`);
    return response.data.data;
};

const updateOrderStatus = async (id, payload) => {
    const response = await apiClients.patch(`/admin/orders/${id}/status`, payload);
    return response.data;
};

const getAdminOrderInvoiceUrl = (id) => `${process.env.REACT_APP_BACKEND_URL}/admin/orders/${id}/invoice`;

export {
    getOrders,
    getOrderById,
    updateOrderStatus,
    getAdminOrderInvoiceUrl,
};
