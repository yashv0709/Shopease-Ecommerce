const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create a product review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide all review details' });
    }

    // 1. Verify that the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 2. Check if user already reviewed this product (prevent duplicates)
    const alreadyReviewed = await Review.findOne({
      user: req.user.id,
      product: productId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    // 3. Check if the user has purchased the product to set the verified purchase badge
    const hasPurchased = await Order.findOne({
      user: req.user.id,
      'items.product': productId,
    });

    // 4. Create review with dynamic isVerifiedPurchase
    const review = await Review.create({
      user: req.user.id,
      product: productId,
      rating: Number(rating),
      comment,
      isVerifiedPurchase: !!hasPurchased,
    });

    // 5. Recalculate Product average rating and numOfReviews
    const productReviews = await Review.find({ product: productId });
    const numOfReviews = productReviews.length;
    const avgRating =
      productReviews.reduce((sum, r) => sum + r.rating, 0) / numOfReviews;

    product.ratings = Number(avgRating.toFixed(1));
    product.numOfReviews = numOfReviews;
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProductReviews,
};
