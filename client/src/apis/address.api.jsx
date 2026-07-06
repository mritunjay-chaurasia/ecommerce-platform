import apiClients from './index';

const getMyAddresses = async () => {
    const response = await apiClients.get('/addresses');
    return response.data.data;
};

const createAddress = async (payload) => {
    const response = await apiClients.post('/addresses', payload);
    return response.data;
};

const updateAddress = async (addressId, payload) => {
    const response = await apiClients.put(`/addresses/${addressId}`, payload);
    return response.data;
};

const deleteAddress = async (addressId) => {
    const response = await apiClients.delete(`/addresses/${addressId}`);
    return response.data;
};

const setDefaultAddress = async (addressId) => {
    const response = await apiClients.patch(`/addresses/${addressId}/default`);
    return response.data;
};

export {
    getMyAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
};
