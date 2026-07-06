import apiClients from './index';

const getStoreSettings = async () => {
    const response = await apiClients.get('/admin/settings');
    return response.data.data;
};

const updateStoreSettings = async (payload) => {
    const response = await apiClients.put('/admin/settings', payload);
    return response.data;
};

export {
    getStoreSettings,
    updateStoreSettings,
};
