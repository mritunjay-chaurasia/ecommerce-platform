import apiClients from './index';

const login = async (payload) => {
    const response = await apiClients.post('/auth/login', payload);
    return response.data.data;
};

const signup = async (payload) => {
    const response = await apiClients.post('/auth/signup', payload);
    return response.data.data;
};

const getProfile = async () => {
    const response = await apiClients.get('/auth/profile');
    return response.data.data;
};

const getUsers = async (params) => {
    const response = await apiClients.get('/admin/users', { params });
    return response.data;
};

const getUserById = async (userId) => {
    const response = await apiClients.get(`/admin/users/${userId}`);
    return response.data.data;
};

const updateUserStatus = async (userId, blocked) => {
    const response = await apiClients.patch(`/admin/users/${userId}/status`, { blocked });
    return response.data;
};

const updateUserVerification = async (userId, payload) => {
    const response = await apiClients.patch(`/admin/users/${userId}/verification`, payload);
    return response.data;
};

const forgotPassword = async (email) => {
    const response = await apiClients.post('/auth/forgot-password', { email });
    return response.data;
};

const resetPassword = async (payload) => {
    const response = await apiClients.post('/auth/reset-password', payload);
    return response.data;
};

const updateProfile = async (payload) => {
    const response = await apiClients.patch('/auth/profile', payload);
    return response.data;
};

const logout = async () => {
    const response = await apiClients.post('/auth/logout');
    return response.data;
};

const refreshSession = async () => {
    const response = await apiClients.post('/auth/refresh');
    return response.data;
};

const changePassword = async (payload) => {
    const response = await apiClients.post('/auth/change-password', payload);
    return response.data;
};

const verifyEmail = async (token) => {
    const response = await apiClients.get('/auth/verify-email', { params: { token } });
    return response.data;
};

const resendVerificationEmail = async () => {
    const response = await apiClients.post('/auth/resend-verification');
    return response.data;
};

const updateUserRole = async (userId, role) => {
    const response = await apiClients.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
};

export {
    login,
    signup,
    getProfile,
    updateProfile,
    changePassword,
    getUsers,
    getUserById,
    updateUserStatus,
    updateUserVerification,
    forgotPassword,
    resetPassword,
    logout,
    refreshSession,
    verifyEmail,
    resendVerificationEmail,
    updateUserRole,
};
