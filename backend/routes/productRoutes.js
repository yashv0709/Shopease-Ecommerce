const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateMiddleware');

const router = express.Router();

// Validation rules for product operations
const productCreateValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Product description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be an integer greater than or equal to 0'),
  body('imageUrl').trim().notEmpty().withMessage('Image URL is required'),
  validateRequest,
];

const productUpdateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be an integer greater than or equal to 0'),
  validateRequest,
];

// Public Routes
router.get('/', getProducts);
router.get('/categories/all', getCategories);
router.get('/:id', getProductById);

// Admin-only Routes
router.post('/', protect, admin, productCreateValidation, createProduct);
router.put('/:id', protect, admin, productUpdateValidation, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
