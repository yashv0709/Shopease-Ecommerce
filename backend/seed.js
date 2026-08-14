const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Review = require('./models/Review');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany();
    await Product.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();

    console.log('Creating sample products...');
    const products = await Product.create([
      {
        name: 'Nike Air Max Running Shoes',
        description: 'Comfortable running shoes with air cushion technology. Perfect for athletes and casual wear alike.',
        price: 3000,
        category: 'Footwear',
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Casual White Sneaker',
        description: 'Minimalist white sneakers that pair perfectly with jeans, chinos, or shorts. Comfortable inner lining.',
        price: 1500,
        category: 'Footwear',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Sports Cotton T-Shirt',
        description: 'Breathable 100% cotton sports training t-shirt. Moisture-wicking technology.',
        price: 1000,
        category: 'Sports',
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Slim Fit Denim Jeans',
        description: 'Classic dark-wash denim jeans with a slim stretch fit. Durable double-stitched seams.',
        price: 2000,
        category: 'Casual',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Smart Workout Watch',
        description: 'Heart rate tracker, step counter, sleep monitor and GPS navigation built in. 7-day battery life.',
        price: 4999,
        category: 'Accessories',
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Leather Messenger Bag',
        description: 'Vintage premium brown leather messenger laptop bag. Multiple compartments and adjustable strap.',
        price: 3500,
        category: 'Accessories',
        stock: 2, // Low stock product for dashboard alerts
        imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Wireless Noise-Canceling Headphones',
        description: 'Over-ear active noise canceling Bluetooth headphones. Hi-res audio with deep bass response.',
        price: 5999,
        category: 'Electronics',
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Pro Grip Basketball',
        description: 'Official size and weight leather basketball. Superior grip and bounce control for indoor/outdoor courts.',
        price: 1200,
        category: 'Sports',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Comfort Gym Sweatpants',
        description: 'Ultra-soft training joggers with tapered ankle cuffs. Breathable warm fleece material with deep pockets.',
        price: 1499,
        category: 'Sports',
        stock: 22,
        imageUrl: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Polarized Aviator Sunglasses',
        description: 'Classic metallic frame aviator sunglasses. 100% UV protection with high contrast polarized lenses.',
        price: 1800,
        category: 'Accessories',
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Minimalist Quartz Wristwatch',
        description: 'Sleek black watch featuring a Japanese quartz movement, genuine leather strap, and waterproof alloy dial.',
        price: 2499,
        category: 'Accessories',
        stock: 14,
        imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Water-Resistant Backpack',
        description: 'Heavy duty canvas backpack with built-in laptop sleeve and USB charging port. Ideal for school or traveling.',
        price: 1600,
        category: 'Accessories',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: '4K Ultra HD Action Camera',
        description: 'Waterproof sports camera capturing high definition 4K video. Built-in stabilization and Wi-Fi transfer support.',
        price: 8999,
        category: 'Electronics',
        stock: 7,
        imageUrl: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB backlit mechanical keyboard with silent tactile switches and dedicated media control volume dial.',
        price: 3200,
        category: 'Electronics',
        stock: 11,
        imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Ultra-Slim Power Bank 10000mAh',
        description: 'Lightweight external battery charger featuring dual fast charge outputs and Type-C input connectivity.',
        price: 1299,
        category: 'Accessories',
        stock: 40,
        imageUrl: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=500&auto=format&fit=crop&q=60',
      },
    ]);

    console.log('Creating sample users...');
    
    // Hash password for users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      name: 'ShopEase Admin',
      email: 'admin@shopease.com',
      password: 'password123', // Will be hashed automatically by user pre-save hook, but let's make sure it does
      role: 'admin',
    });

    const customerUser = await User.create({
      name: 'John Doe',
      email: 'john@gmail.com',
      password: 'password123',
      role: 'customer',
      wishlist: [products[0]._id, products[1]._id],
    });

    const otherCustomer = await User.create({
      name: 'Jane Smith',
      email: 'jane@gmail.com',
      password: 'password123',
      role: 'customer',
    });

    console.log('Creating sample orders...');
    // Create an order for John Doe containing Nike Shoes and Sports T-Shirt
    const order1 = await Order.create({
      user: customerUser._id,
      items: [
        {
          product: products[0]._id,
          quantity: 1,
          price: products[0].price,
        },
        {
          product: products[2]._id,
          quantity: 2,
          price: products[2].price,
        },
      ],
      totalAmount: products[0].price * 1 + products[2].price * 2, // 3000 + 2000 = 5000
      shippingAddress: '123 Main St, New Delhi, India',
      status: 'Shipped',
      paymentStatus: 'Paid',
    });

    // Create an order for Jane Smith containing Smart Watch
    const order2 = await Order.create({
      user: otherCustomer._id,
      items: [
        {
          product: products[4]._id,
          quantity: 1,
          price: products[4].price,
        },
      ],
      totalAmount: products[4].price * 1, // 4999
      shippingAddress: '456 Ring Rd, Bangalore, India',
      status: 'Delivered',
      paymentStatus: 'Paid',
    });

    console.log('Creating sample reviews...');
    // Only users who purchased can review. John Doe purchased products[0] (Nike Shoes)
    const review1 = await Review.create({
      user: customerUser._id,
      product: products[0]._id,
      rating: 5,
      comment: 'Very comfortable running shoes! Fits perfectly and looks great.',
      isVerifiedPurchase: true,
    });

    // Jane Smith purchased products[4] (Smart Watch)
    const review2 = await Review.create({
      user: otherCustomer._id,
      product: products[4]._id,
      rating: 4,
      comment: 'Excellent smart watch, great battery life. Tracking is accurate.',
      isVerifiedPurchase: true,
    });

    // Update Product average ratings and reviews count
    products[0].ratings = 5.0;
    products[0].numOfReviews = 1;
    await products[0].save();

    products[4].ratings = 4.0;
    products[4].numOfReviews = 1;
    await products[4].save();

    console.log('Creating sample carts...');
    await Cart.create({
      user: customerUser._id,
      items: [
        {
          product: products[1]._id,
          quantity: 1,
        },
      ],
    });

    console.log('Database Seeding Successful!');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

// Only execute directly
if (require.main === module) {
  seedData();
}
