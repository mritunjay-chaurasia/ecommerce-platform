import axios from 'axios';

const apiClients = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    timeout: 30000,
});

let unauthorizedHandler = null;
let isRefreshing = false;
let failedQueue = [];
let isHandlingUnauthorized = false;

const AUTH_PATHS = [
    '/auth/login',
    '/auth/signup',
    '/auth/refresh',
    '/auth/forgot-password',
    '/auth/reset-password',
];

const isAuthPath = (url) => {
    if (!url) {
        return false;
    }

    return AUTH_PATHS.some((path) => url.includes(path));
};

const processQueue = (error) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });
    failedQueue = [];
};

const runUnauthorizedHandler = () => {
    if (!unauthorizedHandler || isHandlingUnauthorized) {
        return;
    }

    isHandlingUnauthorized = true;
    unauthorizedHandler();
    isHandlingUnauthorized = false;
};

export const setUnauthorizedHandler = (handler) => {
    unauthorizedHandler = handler;
};

apiClients.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401
            && originalRequest
            && !originalRequest._retry
            && !isAuthPath(originalRequest.url)
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => apiClients(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await apiClients.post('/auth/refresh');
                processQueue(null);
                return apiClients(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                runUnauthorizedHandler();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (error.response?.status === 401 && !isAuthPath(originalRequest?.url)) {
            runUnauthorizedHandler();
        }

        return Promise.reject(error);
    },
);

export default apiClients;
