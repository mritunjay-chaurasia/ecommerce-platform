const sanitizeValue = (value) => {
    if (value === null || typeof value !== 'object') {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }

    const sanitized = {};

    Object.keys(value).forEach((key) => {
        if (key.startsWith('$') || key.includes('.')) {
            return;
        }

        sanitized[key] = sanitizeValue(value[key]);
    });

    return sanitized;
};

const mongoSanitize = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeValue(req.body);
    }

    next();
};

module.exports = mongoSanitize;
