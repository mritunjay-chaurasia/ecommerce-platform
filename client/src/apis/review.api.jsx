import apiClients from './index';

const getReviews = async (params) => {
    const response = await apiClients.get('/admin/reviews', { params });
    return response.data;
};

const updateReviewStatus = async (id, payload) => {
    const response = await apiClients.patch(`/admin/reviews/${id}/status`, payload);
    return response.data;
};

const deleteReview = async (id) => {
    const response = await apiClients.delete(`/admin/reviews/${id}`);
    return response.data;
};

export {
    getReviews,
    updateReviewStatus,
    deleteReview,
};
