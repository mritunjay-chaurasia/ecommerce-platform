const Joi = require('joi');

const envSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(5000),
    MONGO_URI: Joi.string().required(),
    FRONTEND_URL: Joi.string().uri().required(),
    JWT_SECRET: Joi.string().min(32).required(),
    JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
    RESET_PASSWORD_EXPIRY_MS: Joi.number().default(900000),
    DEBUG_RESET_TOKEN: Joi.string().valid('true', 'false').default('false'),
    CLUSTER_WORKERS: Joi.number().optional(),
    GOOGLE_CLIENT_ID: Joi.string().optional(),
    GOOGLE_CLIENT_SECRET: Joi.string().optional(),
    GOOGLE_CALLBACK_URL: Joi.string().uri().optional(),
    COOKIE_SAME_SITE: Joi.string().valid('lax', 'strict', 'none').optional(),
    COOKIE_SECURE: Joi.string().valid('true', 'false').optional(),
    SMTP_HOST: Joi.string().optional(),
    SMTP_PORT: Joi.number().default(587),
    SMTP_SECURE: Joi.string().valid('true', 'false').default('false'),
    SMTP_USER: Joi.string().allow('').optional(),
    SMTP_PASS: Joi.string().allow('').optional(),
    SMTP_FROM: Joi.string().optional(),
}).unknown().custom((value, helpers) => {
    if (value.COOKIE_SAME_SITE === 'none' && value.COOKIE_SECURE !== 'true') {
        return helpers.error('any.custom', {
            message: 'COOKIE_SECURE must be "true" when COOKIE_SAME_SITE is "none"',
        });
    }

    return value;
});

const validateEnv = () => {
    const { error, value } = envSchema.validate(process.env, {
        abortEarly: false,
        stripUnknown: false,
    });

    if (error) {
        const messages = error.details.map((detail) => detail.message).join(', ');
        throw new Error(`Environment validation failed: ${messages}`);
    }

    return value;
};

module.exports = validateEnv;
