const express = require('express');
const { getDashboardStats, getSupportRequests, resolveSupportRequest } = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, admin, getDashboardStats);
router.get('/support-requests', protect, admin, getSupportRequests);
router.put('/support-requests/:id/resolve', protect, admin, resolveSupportRequest);

module.exports = router;
