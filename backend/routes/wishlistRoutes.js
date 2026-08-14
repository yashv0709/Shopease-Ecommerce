const express = require('express');
const { param } = require('express-validator');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect); // All wishlist routes require login

const idValidation = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
  validateRequest,
];

router.get('/', getWishlist);
router.post('/:productId', idValidation, addToWishlist);
router.delete('/:productId', idValidation, removeFromWishlist);

module.exports = router;
