const request = require('supertest');

let app;

beforeAll(() => {
    app = require('../../app');
});

describe('Health API', () => {
    it('returns healthy status', async () => {
        const response = await request(app).get('/api/health');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });
});
