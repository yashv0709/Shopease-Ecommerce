const express = require('express');
const { body, param } = require('express-validator');
const { createReview, getProductReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateMiddleware');

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('productId').isMongoId().withMessage('Please provide a valid product ID'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be an integer between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required'),
    validateRequest,
  ],
  createReview
);

router.get(
  '/:productId',
  [
    param('productId').isMongoId().withMessage('Invalid product ID'),
    validateRequest,
  ],
  getProductReviews
);

module.exports = router;
