const http = require('http');
const os = require('os');
const cluster = require('cluster');
require('dotenv').config({ quiet: true });

const validateEnv = require('./src/config/env.config');
const { connectDB, disconnectDB } = require('./src/config/db.config');

validateEnv();

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const cpusLength = os.cpus().length;
const workerCount = isProduction
    ? (Number(process.env.CLUSTER_WORKERS) || cpusLength)
    : 1;

let isShuttingDown = false;

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

const startServer = async () => {
    await connectDB();

    const app = require('./app');
    const server = http.createServer(app);

    server.listen(PORT, () => {
        console.log(`Worker ${process.pid} listening on port ${PORT} [${process.env.NODE_ENV}]`);
    });

    const shutdown = async (signal) => {
        console.log(`Worker ${process.pid} received ${signal}, closing server...`);
        server.close(async () => {
            await disconnectDB();
            process.exit(0);
        });
        setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};

const startCluster = () => {
    console.log(`Primary ${process.pid} starting ${workerCount} workers`);

    for (let i = 0; i < workerCount; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        if (isShuttingDown) return;

        const reason = signal || code;
        console.error(`Worker ${worker.process.pid} died (${reason}). Restarting...`);
        cluster.fork();
    });

    const shutdown = (signal) => {
        isShuttingDown = true;
        console.log(`Primary ${process.pid} received ${signal}, shutting down workers...`);

        for (const worker of Object.values(cluster.workers)) {
            worker.kill('SIGTERM');
        }

        setTimeout(() => process.exit(0), 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};

if (workerCount <= 1) {
    startServer().catch((err) => {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    });
} else if (cluster.isPrimary) {
    startCluster();
} else {
    startServer().catch((err) => {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    });
}
