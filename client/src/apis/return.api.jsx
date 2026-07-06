import apiClients from './index';

const createReturnRequest = async (orderId, payload) => {
    const response = await apiClients.post(`/orders/${orderId}/return-request`, payload);
    return response.data;
};

const getMyReturnRequests = async () => {
    const response = await apiClients.get('/returns/my');
    return response.data.data;
};

const getAdminReturnRequests = async (params) => {
    const response = await apiClients.get('/admin/returns', { params });
    return response.data;
};

const updateReturnRequestStatus = async (returnId, payload) => {
    const response = await apiClients.patch(`/admin/returns/${returnId}/status`, payload);
    return response.data;
};

export {
    createReturnRequest,
    getMyReturnRequests,
    getAdminReturnRequests,
    updateReturnRequestStatus,
};
