const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

const TEST_MONGODB_URI = process.env.MONGODB_URI 
  ? (process.env.MONGODB_URI.includes('?') 
      ? process.env.MONGODB_URI.replace(/\/[^/?]+(\?)/, '/ecommerce_test$1')
      : process.env.MONGODB_URI.replace(/\/[^/]+$/, '/ecommerce_test'))
  : 'mongodb://localhost:27017/ecommerce_test';

beforeAll(async () => {
  // Ensure we are connected to the test database
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_MONGODB_URI);
  }
});

afterAll(async () => {
  // Cleanup database and close mongoose connection
  if (mongoose.connection.readyState !== 0) {
    await User.deleteMany();
    await mongoose.connection.close();
  }
});

beforeEach(async () => {
  // Clean users before each test run
  await User.deleteMany();
});

describe('Authentication API Endpoint Tests', () => {
  const testUser = {
    name: 'Test Customer',
    email: 'testcustomer@gmail.com',
    password: 'password123',
  };

  test('POST /api/auth/register - Should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.user.name).toBe(testUser.name);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.role).toBe('customer');
    expect(res.headers['set-cookie']).toBeDefined(); // Token cookie is set
  });

  test('POST /api/auth/register - Should fail on register validation rules (password too short)', async () => {
    const invalidUser = { ...testUser, password: '123' };
    const res = await request(app)
      .post('/api/auth/register')
      .send(invalidUser)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  test('POST /api/auth/register - Should fail on duplicate emails', async () => {
    // Insert initial user
    await User.create(testUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('exists');
  });

  test('POST /api/auth/login - Should login user and set HTTP-only cookie', async () => {
    // Register user first
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('POST /api/auth/login - Should fail on incorrect login credentials', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/profile - Should retrieve user profile with valid JWT cookie', async () => {
    // Register user and get cookies
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const cookies = regRes.headers['set-cookie'];

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.user.name).toBe(testUser.name);
  });

  test('GET /api/auth/profile - Should reject request if no token is provided', async () => {
    const res = await request(app).get('/api/auth/profile').expect(401);
    expect(res.body.success).toBe(false);
  });
});
