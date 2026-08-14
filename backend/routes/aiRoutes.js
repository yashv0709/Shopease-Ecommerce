const express = require('express');
const rateLimit = require('express-rate-limit');
const { getRecommendation, generateDescription, getMySupportRequests } = require('../controllers/aiController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Rate limiter specifically for AI endpoints to protect API budgets
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  message: {
    success: false,
    message: 'Too many requests. Please wait a minute before asking the AI again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to validate message input length (max 500 chars)
const validateMessageLength = (req, res, next) => {
  const { message } = req.body;
  if (message && message.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Message length exceeds the maximum limit of 500 characters',
    });
  }
  next();
};

// Customer facing route (AI Assistant)
router.post('/assistant', aiLimiter, validateMessageLength, getRecommendation);

// Customer fetching their own support requests
router.get('/my-support-requests', protect, getMySupportRequests);

// Admin-only description generator route
router.post('/describe', protect, admin, generateDescription);

module.exports = router;
