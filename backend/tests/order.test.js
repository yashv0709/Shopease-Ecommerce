const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const TEST_MONGODB_URI = process.env.MONGODB_URI 
  ? (process.env.MONGODB_URI.includes('?') 
      ? process.env.MONGODB_URI.replace(/\/[^/?]+(\?)/, '/ecommerce_test$1')
      : process.env.MONGODB_URI.replace(/\/[^/]+$/, '/ecommerce_test'))
  : 'mongodb://localhost:27017/ecommerce_test';

let customerCookie = '';
let customerId = '';
let testProduct = null;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_MONGODB_URI);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await Order.deleteMany();
    await Cart.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await mongoose.connection.close();
  }
});

beforeEach(async () => {
  await Order.deleteMany();
  await Cart.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();

  // Create Customer User
  const customer = {
    name: 'Customer Test',
    email: 'customertest@gmail.com',
    password: 'password123',
  };
  const regRes = await request(app).post('/api/auth/register').send(customer);
  customerCookie = regRes.headers['set-cookie'];
  customerId = regRes.body.user._id;

  // Create Product with Stock = 5
  testProduct = await Product.create({
    name: 'Testing Shoes',
    description: 'High performance testing shoes',
    price: 1000,
    category: 'Sports',
    stock: 5,
    imageUrl: 'http://test.com/shoes.jpg',
  });
});

describe('Checkout and Order Management API Tests', () => {
  test('POST /api/cart - Should sync cart items to database', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Cookie', customerCookie)
      .send({ productId: testProduct._id, quantity: 2 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.cart.items.length).toBe(1);
    expect(res.body.cart.items[0].quantity).toBe(2);
    expect(res.body.cart.totalPrice).toBe(2000);
  });

  test('POST /api/orders - Should execute transaction-safe checkout, create order, deduct stock, and clear cart', async () => {
    // 1. Add item to cart
    await request(app)
      .post('/api/cart')
      .set('Cookie', customerCookie)
      .send({ productId: testProduct._id, quantity: 2 });

    // 2. Checkout
    const checkoutRes = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie)
      .send({ shippingAddress: '123 Test St, Test City' })
      .expect(201);

    expect(checkoutRes.body.success).toBe(true);
    expect(checkoutRes.body.order).toBeDefined();
    expect(checkoutRes.body.order.totalAmount).toBe(2000);

    // 3. Verify stock has decremented (5 - 2 = 3)
    const productAfterCheckout = await Product.findById(testProduct._id);
    expect(productAfterCheckout.stock).toBe(3);

    // 4. Verify cart is cleared
    const cartRes = await request(app)
      .get('/api/cart')
      .set('Cookie', customerCookie)
      .expect(200);

    expect(cartRes.body.cart.items.length).toBe(0);
    expect(cartRes.body.cart.totalPrice).toBe(0);
  });

  test('POST /api/orders - Should reject checkout and rollback if requested quantity exceeds product stock availability', async () => {
    // 1. Add product to cart with quantity = 10 (exceeds stock = 5)
    await request(app)
      .post('/api/cart')
      .set('Cookie', customerCookie)
      .send({ productId: testProduct._id, quantity: 10 });

    // 2. Checkout should fail (stock limit hit)
    const checkoutRes = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie)
      .send({ shippingAddress: '123 Test St, Test City' })
      .expect(400);

    expect(checkoutRes.body.success).toBe(false);
    expect(checkoutRes.body.message).toContain('stock');

    // 3. Verify stock is unchanged (remains 5)
    const productAfterFail = await Product.findById(testProduct._id);
    expect(productAfterFail.stock).toBe(5);

    // 4. Verify cart is NOT cleared (items remain for editing)
    const cartRes = await request(app)
      .get('/api/cart')
      .set('Cookie', customerCookie)
      .expect(200);

    expect(cartRes.body.cart.items.length).toBe(1);
    expect(cartRes.body.cart.items[0].quantity).toBe(10);
  });

  test('POST /api/orders/:id/cancel - Should successfully cancel order, restore product stock, and update status', async () => {
    // 1. Add item and checkout
    await request(app)
      .post('/api/cart')
      .set('Cookie', customerCookie)
      .send({ productId: testProduct._id, quantity: 2 });

    const checkoutRes = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie)
      .send({ shippingAddress: '123 Test St, Test City' });

    const orderId = checkoutRes.body.order._id;

    // Verify stock is decremented to 3
    let prod = await Product.findById(testProduct._id);
    expect(prod.stock).toBe(3);

    // 2. Cancel order
    const cancelRes = await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .set('Cookie', customerCookie)
      .expect(200);

    expect(cancelRes.body.success).toBe(true);
    expect(cancelRes.body.order.status).toBe('Cancelled');

    // 3. Verify stock is restored to 5
    prod = await Product.findById(testProduct._id);
    expect(prod.stock).toBe(5);
  });

  test('POST /api/orders/:id/cancel - Should prevent cancelling Shipped orders', async () => {
    // 1. Add item and checkout
    await request(app)
      .post('/api/cart')
      .set('Cookie', customerCookie)
      .send({ productId: testProduct._id, quantity: 2 });

    const checkoutRes = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie)
      .send({ shippingAddress: '123 Test St, Test City' });

    const orderId = checkoutRes.body.order._id;

    // 2. Manually set status to Shipped in DB
    await Order.findByIdAndUpdate(orderId, { status: 'Shipped' });

    // 3. Cancel order should fail
    const cancelRes = await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .set('Cookie', customerCookie)
      .expect(400);

    expect(cancelRes.body.success).toBe(false);
    expect(cancelRes.body.message).toContain('cannot be cancelled');
  });
});
