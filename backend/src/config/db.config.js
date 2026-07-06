const mongoose = require('mongoose');
const User = require('../models/auth.model');

const migrateGoogleIdIndex = async () => {
    await User.updateMany(
        { $or: [{ googleId: null }, { googleId: '' }] },
        { $unset: { googleId: 1 } },
    );

    try {
        await User.collection.dropIndex('googleId_1');
    } catch (err) {
        if (err.code !== 27 && err.codeName !== 'IndexNotFound' && err.code !== 26) {
            throw err;
        }
    }

    await User.syncIndexes();
};

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    await migrateGoogleIdIndex();
    console.log(`MongoDB connected: ${conn.connection.host}`);
};

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
});

const disconnectDB = async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
};

module.exports = { connectDB, disconnectDB };
