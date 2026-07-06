export const getApiErrorMessage = (error, fallback = 'Something went wrong') =>
    error?.response?.data?.message || fallback;

export const isRateLimitError = (error) => error?.response?.status === 429;

let lastRateLimitToastAt = 0;
const RATE_LIMIT_TOAST_COOLDOWN_MS = 5000;

export const showToastMessage = (toast, message, type = 'info', duration) => {
    const safeType = ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info';

    toast[safeType](message, duration);
};

export const showApiError = (toast, error, fallback) => {
    if (isRateLimitError(error)) {
        const now = Date.now();

        if (now - lastRateLimitToastAt < RATE_LIMIT_TOAST_COOLDOWN_MS) {
            return;
        }

        lastRateLimitToastAt = now;
    }

    showToastMessage(toast, getApiErrorMessage(error, fallback), 'error');
};

export const formatValidationErrors = (errors) => {
    if (typeof errors === 'string') {
        return errors;
    }

    const messages = Object.values(errors || {}).filter(Boolean);

    if (messages.length === 0) {
        return 'Please fix the errors in the form';
    }

    return messages.join(' • ');
};

export const showFormValidationToast = (toast, errors) => {
    showToastMessage(toast, formatValidationErrors(errors), 'warning');
};
