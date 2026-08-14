const express = require('express');
const { body, param } = require('express-validator');
const {
  checkout,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  cancelMyOrder,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect); // All order routes require user authentication

// Customer checkout route
router.post(
  '/',
  [
    body('shippingAddress')
      .trim()
      .notEmpty()
      .withMessage('Shipping address is required for checkout'),
    validateRequest,
  ],
  checkout
);

// Customer fetching their own orders
router.get('/my-orders', getMyOrders);
router.post('/:id/cancel', cancelMyOrder);

// Admin-only routing
router.get('/', admin, getOrders);
router.put(
  '/:id/status',
  admin,
  [
    param('id').isMongoId().withMessage('Invalid order ID'),
    body('status')
      .trim()
      .notEmpty()
      .withMessage('Order status is required'),
    validateRequest,
  ],
  updateOrderStatus
);

module.exports = router;
