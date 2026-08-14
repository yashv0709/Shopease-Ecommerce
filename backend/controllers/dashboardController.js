const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get dashboard metrics (Admin only)
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total Counts
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'customer' }); // Count customers only

    // 2. Total Revenue
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 3. Recent Orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // 4. Low-Stock Products (Stock <= 5)
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .limit(5);

    // 5. Best-Selling Products (Mongoose Aggregation)
    const bestSellers = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          name: '$product.name',
          price: '$product.price',
          stock: '$product.stock',
          imageUrl: '$product.imageUrl',
        },
      },
    ]);

    // 6. Category Sales Aggregation
    const categorySales = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$product.category', 'Uncategorized'] },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          unitsSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // 7. Order Status Distribution Aggregation
    const orderStatusDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
      },
      recentOrders,
      lowStockProducts,
      bestSellers,
      categorySales,
      orderStatusDistribution,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all chatbot support requests (Admin only)
// @route   GET /api/dashboard/support-requests
// @access  Private/Admin
const getSupportRequests = async (req, res, next) => {
  try {
    const SupportRequest = require('../models/SupportRequest');
    const requests = await SupportRequest.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve a support request (Admin only)
// @route   PUT /api/dashboard/support-requests/:id/resolve
// @access  Private/Admin
const resolveSupportRequest = async (req, res, next) => {
  try {
    const SupportRequest = require('../models/SupportRequest');
    const request = await SupportRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Support request not found' });
    }

    const { resolution } = req.body;
    request.status = 'Resolved';
    request.resolution = resolution || 'Your request has been resolved by our support team.';
    await request.save();

    res.status(200).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getSupportRequests,
  resolveSupportRequest,
};
