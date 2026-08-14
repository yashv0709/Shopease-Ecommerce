const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to get cart and populate product details
const getPopulatedCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  // Calculate cart total dynamically from populated product prices
  let totalPrice = 0;
  const activeItems = [];

  for (const item of cart.items) {
    if (item.product) {
      totalPrice += item.product.price * item.quantity;
      activeItems.push(item);
    }
  }

  // If some products were deleted, clean up the cart in background
  if (activeItems.length !== cart.items.length) {
    cart.items = activeItems;
    await cart.save();
  }

  return {
    _id: cart._id,
    user: cart.user,
    items: cart.items,
    totalPrice,
  };
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    const cartData = await getPopulatedCart(req.user.id);
    res.status(200).json({ success: true, cart: cartData });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Check if product already exists in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Product exists, update quantity
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      // Product doesn't exist, push new item
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    const cartData = await getPopulatedCart(req.user.id);

    res.status(200).json({ success: true, cart: cartData });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || Number(quantity) < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = Number(quantity);
    await cart.save();

    const cartData = await getPopulatedCart(req.user.id);
    res.status(200).json({ success: true, cart: cartData });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    const cartData = await getPopulatedCart(req.user.id);

    res.status(200).json({ success: true, cart: cartData });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    const cartData = await getPopulatedCart(req.user.id);
    res.status(200).json({ success: true, cart: cartData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
