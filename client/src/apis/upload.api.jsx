import apiClients from './index';

const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClients.post('/admin/uploads', formData, {
        transformRequest: [(data, headers) => {
            delete headers['Content-Type'];
            return data;
        }],
    });

    return response.data.data;
};

export {
    uploadImage,
};
