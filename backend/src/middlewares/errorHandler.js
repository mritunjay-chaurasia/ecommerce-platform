const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = 'Invalid JSON payload';
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid resource ID';
    }

    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        const duplicateMessages = {
            email: 'Email is already registered',
            phone: 'Phone number is already registered',
            googleId: 'This Google account is already linked to another user',
            name: 'Category name already exists',
            slug: 'Category slug already exists',
        };
        message = duplicateMessages[field] || `${field} already exists`;
    }

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(', ');
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    if (statusCode === 500) {
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(err.errors && { errors: err.errors }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
