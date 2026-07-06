const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('./src/config/passport');
const { generalApiLimiter } = require('./src/middlewares/rateLimiters');
const routes = require('./src/routes/index');
const healthRouter = require('./src/routes/health.router');
const notFound = require('./src/middlewares/notFound');
const errorHandler = require('./src/middlewares/errorHandler');
const csrfProtection = require('./src/middlewares/csrfProtection');
const mongoSanitize = require('./src/middlewares/mongoSanitize');

const app = express();

app.set('trust proxy', 1);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize);

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
}));

app.use(passport.initialize());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/health', healthRouter);

app.use(generalApiLimiter);

app.use('/api', csrfProtection, routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
