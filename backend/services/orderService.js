const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

/**
 * Creates an order from the user's active cart.
 * Uses a Mongoose transaction session. If the MongoDB deployment does not support
 * transactions (e.g. local standalone database), it falls back gracefully to a
 * non-transactional sequence while keeping atomic stock checks.
 */
const createOrder = async (userId, shippingAddress) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const order = await executeOrderCreation(userId, shippingAddress, session);

    await session.commitTransaction();
    session.endSession();
    return order;
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        // Suppress session close errors if already aborted/ended
      }
      session.endSession();
    }

    // Check if error is due to database setup not supporting transactions (local standalone vs Atlas Replica Set)
    const isTxNotSupported = 
      error.message.includes('transaction') || 
      error.code === 251 || 
      error.message.includes('Replica Set') || 
      error.message.includes('Transaction numbers');

    if (isTxNotSupported) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('MongoDB deployment does not support transactions (likely standalone). Falling back to non-transactional checkout.');
      }
      // Retry execution without transaction session
      return await executeOrderCreation(userId, shippingAddress, null);
    }

    // Rethrow actual business validation error (e.g., out of stock, empty cart)
    throw error;
  }
};

/**
 * Internal helper to run order checkout steps
 */
const executeOrderCreation = async (userId, shippingAddress, session) => {
  const sessionOpt = session ? { session } : {};

  // 1. Retrieve the user's cart
  const cart = await Cart.findOne({ user: userId }).session(session);
  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  const orderItems = [];
  let totalAmount = 0;
  const decrementedItems = []; // For rollback in manual fallback mode if a later item fails stock check

  try {
    // 2. Atomically check and decrement stock for each item
    for (const item of cart.items) {
      const productId = item.product;
      const quantity = item.quantity;

      // Atomic check and decrement operation
      const product = await Product.findOneAndUpdate(
        {
          _id: productId,
          stock: { $gte: quantity },
        },
        {
          $inc: { stock: -quantity },
        },
        {
          new: true,
          runValidators: true,
          ...sessionOpt,
        }
      );

      if (!product) {
        throw new Error(`Insufficient stock for item in cart`);
      }

      // Track items decremented so we can manually roll back if not using transactions
      decrementedItems.push({ productId, quantity });

      const price = product.price;
      totalAmount += price * quantity;

      orderItems.push({
        product: productId,
        quantity,
        price,
      });
    }

    // 3. Create the order
    const orderData = {
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: 'Placed',
      paymentStatus: 'Paid', // Simulation of payment success
    };

    let order;
    if (session) {
      const createdOrders = await Order.create([orderData], { session });
      order = createdOrders[0];
    } else {
      order = await Order.create(orderData);
    }

    // 4. Clear the cart
    cart.items = [];
    if (session) {
      await cart.save({ session });
    } else {
      await cart.save();
    }

    return order;
  } catch (checkoutError) {
    // If not using transactions, manually restore inventory stock that was decremented
    if (!session) {
      for (const item of decrementedItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }
    throw checkoutError;
  }
};

/**
 * Cancels an order, updating its status to 'Cancelled' and restoring product stock
 */
const cancelOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }
  if (order.status === 'Cancelled') {
    throw new Error('Order is already cancelled');
  }
  if (order.status === 'Shipped' || order.status === 'Delivered') {
    throw new Error('Shipped or delivered orders cannot be cancelled');
  }

  // Restore inventory stock for each item in the order
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.status = 'Cancelled';
  await order.save();
  return order;
};

module.exports = {
  createOrder,
  cancelOrder,
};
