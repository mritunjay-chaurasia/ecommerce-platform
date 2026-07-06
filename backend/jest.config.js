module.exports = {
    testEnvironment: 'node',
    projects: [
        {
            displayName: 'unit',
            testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
            setupFiles: ['<rootDir>/tests/env.js'],
        },
        {
            displayName: 'integration',
            testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
            setupFiles: ['<rootDir>/tests/env.js'],
            setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
        },
    ],
    testTimeout: 30000,
};
