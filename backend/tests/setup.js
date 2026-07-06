const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();

    const { connectDB } = require('../src/config/db.config');
    await connectDB();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

afterEach(async () => {
    const { collections } = mongoose.connection;

    await Promise.all(
        Object.values(collections).map((collection) => collection.deleteMany({})),
    );
});
