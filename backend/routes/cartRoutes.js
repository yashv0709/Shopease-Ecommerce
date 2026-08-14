const express = require('express');
const { body, param } = require('express-validator');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect); // All cart routes require user login

const addCartValidation = [
  body('productId').isMongoId().withMessage('Please provide a valid product ID'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validateRequest,
];

const updateCartValidation = [
  param('productId').isMongoId().withMessage('Please provide a valid product ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validateRequest,
];

router.route('/')
  .get(getCart)
  .post(addCartValidation, addToCart)
  .delete(clearCart);

router.route('/:productId')
  .put(updateCartValidation, updateCartItem)
  .delete(removeCartItem);

module.exports = router;
