import apiClients from './index';

const getAdminDashboardStats = async () => {
    const response = await apiClients.get('/admin/dashboard/stats');
    return response.data.data;
};

export {
    getAdminDashboardStats,
};
