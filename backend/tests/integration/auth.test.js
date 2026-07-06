const request = require('supertest');

let app;

beforeAll(() => {
    app = require('../../app');
});

const post = (path) => request(app)
    .post(path)
    .set('X-Requested-With', 'XMLHttpRequest');

describe('Auth API', () => {
    it('registers a new customer', async () => {
        const response = await post('/api/auth/signup')
            .send({
                firstName: 'Test',
                lastName: 'User',
                email: 'testuser@example.com',
                password: 'Password123!',
                phone: '9876543210',
                gender: 'male',
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe('testuser@example.com');
    });

    it('logs in an existing customer', async () => {
        await post('/api/auth/signup')
            .send({
                firstName: 'Login',
                lastName: 'User',
                email: 'loginuser@example.com',
                password: 'Password123!',
                phone: '9876543211',
                gender: 'female',
            });

        const response = await post('/api/auth/login')
            .send({
                email: 'loginuser@example.com',
                password: 'Password123!',
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.headers['set-cookie']).toBeDefined();
    });
});
