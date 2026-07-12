require('dotenv').config({ quiet: true });

const validateEnv = require('../config/env.config');
const { connectDB, disconnectDB } = require('../config/db.config');
const seedDefaultCategories = require('../config/seedCategories');
const seedDefaultProducts = require('../config/seedProducts');

validateEnv();

const run = async () => {
    try {
        await connectDB({ skipSeed: true });
        await seedDefaultCategories();
        const stats = await seedDefaultProducts();
        console.log('Product seed completed:', stats);
    } catch (error) {
        console.error('Product seed failed:', error.message);
        process.exitCode = 1;
    } finally {
        await disconnectDB();
    }
};

run();
