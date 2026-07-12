require('dotenv').config({ quiet: true });

const validateEnv = require('../config/env.config');
const { connectDB, disconnectDB } = require('../config/db.config');
const seedDefaultCategories = require('../config/seedCategories');

validateEnv();

const run = async () => {
    try {
        await connectDB({ skipSeed: true });
        const stats = await seedDefaultCategories();
        console.log('Seed completed:', stats);
    } catch (error) {
        console.error('Category seed failed:', error.message);
        process.exitCode = 1;
    } finally {
        await disconnectDB();
    }
};

run();
