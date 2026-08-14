const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/Product');
const User = require('../models/User');

const TEST_MONGODB_URI = process.env.MONGODB_URI 
  ? (process.env.MONGODB_URI.includes('?') 
      ? process.env.MONGODB_URI.replace(/\/[^/?]+(\?)/, '/ecommerce_test$1')
      : process.env.MONGODB_URI.replace(/\/[^/]+$/, '/ecommerce_test'))
  : 'mongodb://localhost:27017/ecommerce_test';

let adminCookie = '';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_MONGODB_URI);
  }

  // Create an admin user to get auth cookies
  await User.deleteMany();
  const adminUser = {
    name: 'Admin Root',
    email: 'admin_test@shopease.com',
    password: 'password123',
    role: 'admin',
  };
  const res = await request(app).post('/api/auth/register').send(adminUser);
  adminCookie = res.headers['set-cookie'];
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await Product.deleteMany();
    await User.deleteMany();
    await mongoose.connection.close();
  }
});

beforeEach(async () => {
  await Product.deleteMany();
});

describe('Product API Catalog Tests', () => {
  const sampleProducts = [
    {
      name: 'Nike Running Zoom',
      description: 'Athletic sports running shoes',
      price: 2500,
      category: 'Sports',
      stock: 10,
      imageUrl: 'http://test.com/nike.jpg',
    },
    {
      name: 'Adidas Casual Tee',
      description: 'Cotton everyday wear t-shirt',
      price: 1200,
      category: 'Casual',
      stock: 15,
      imageUrl: 'http://test.com/adidas.jpg',
    },
    {
      name: 'Vizio Smart LED TV',
      description: '4K Ultra HD television display panel',
      price: 22000,
      category: 'Electronics',
      stock: 3,
      imageUrl: 'http://test.com/tv.jpg',
    },
  ];

  test('GET /api/products - Should retrieve all products with correct count', async () => {
    await Product.create(sampleProducts);

    const res = await request(app).get('/api/products').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.products.length).toBe(3);
    expect(res.body.totalProducts).toBe(3);
  });

  test('GET /api/products - Should filter products by category', async () => {
    await Product.create(sampleProducts);

    const res = await request(app)
      .get('/api/products')
      .query({ category: 'Sports' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.products.length).toBe(1);
    expect(res.body.products[0].name).toBe('Nike Running Zoom');
  });

  test('GET /api/products - Should execute partial text search', async () => {
    await Product.create(sampleProducts);

    const res = await request(app)
      .get('/api/products')
      .query({ search: 'smart' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.products.length).toBe(1);
    expect(res.body.products[0].name).toContain('Vizio');
  });

  test('GET /api/products - Should sort products by price ascending', async () => {
    await Product.create(sampleProducts);

    const res = await request(app)
      .get('/api/products')
      .query({ sort: 'price_asc' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.products[0].price).toBe(1200); // Adidas
    expect(res.body.products[2].price).toBe(22000); // TV
  });

  test('POST /api/products - Admin should be able to create a product', async () => {
    const newProduct = {
      name: 'Puma Sports Bottle',
      description: 'Stainless steel water bottle',
      price: 800,
      category: 'Sports',
      stock: 50,
      imageUrl: 'http://test.com/puma.jpg',
    };

    const res = await request(app)
      .post('/api/products')
      .set('Cookie', adminCookie)
      .send(newProduct)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.product.name).toBe(newProduct.name);
  });

  test('POST /api/products - Non-admin should be rejected', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Fail product' })
      .expect(401); // Unauthorized

    expect(res.body.success).toBe(false);
  });
});
