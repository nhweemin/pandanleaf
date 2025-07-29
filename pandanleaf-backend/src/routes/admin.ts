import express from 'express';
import User from '../models/User';
import Chef from '../models/Chef';
import Product from '../models/Product';
import Order from '../models/Order';

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalChefs = await User.countDocuments({ role: 'chef' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Get chef statistics
    const approvedChefs = await Chef.countDocuments({ isApproved: true });
    const pendingChefs = await Chef.countDocuments({ 'verification.status': 'pending' });
    const activeChefs = await Chef.countDocuments({ isActive: true });

    // Get product statistics
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const availableProducts = await Product.countDocuments({ 
      isActive: true, 
      'availability.isAvailable': true 
    });

    // Get order statistics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Calculate revenue (total of all completed orders)
    const revenueData = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$pricing.total' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Get recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = await Order.countDocuments({
      'timeline.placedAt': { $gte: thirtyDaysAgo }
    });

    // Get top-rated chefs
    const topChefs = await Chef.find({ isApproved: true })
      .populate('userId', 'name email')
      .sort({ 'rating.average': -1 })
      .limit(5);

    // Get popular products
    const popularProducts = await Product.find({ isActive: true })
      .populate('chefId', 'businessName')
      .sort({ 'orders.total': -1 })
      .limit(5);

    return res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          chefs: totalChefs,
          admins: totalAdmins
        },
        chefs: {
          total: totalChefs,
          approved: approvedChefs,
          pending: pendingChefs,
          active: activeChefs
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          available: availableProducts
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
          recent: recentOrders
        },
        revenue: {
          total: totalRevenue,
          averageOrderValue: completedOrders > 0 ? totalRevenue / completedOrders : 0
        },
        topChefs,
        popularProducts
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching platform statistics'
    });
  }
});

// @route   GET /api/admin/chefs/pending
// @desc    Get pending chef applications
// @access  Private (Admin only)
router.get('/chefs/pending', async (req, res) => {
  try {
    const pendingChefs = await Chef.find({ 'verification.status': 'pending' })
      .populate('userId', 'name email phone')
      .sort({ 'verification.submittedAt': -1 });

    return res.json({
      success: true,
      data: { chefs: pendingChefs }
    });
  } catch (error) {
    console.error('Get pending chefs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching pending chef applications'
    });
  }
});

// @route   PUT /api/admin/chefs/:id/approve
// @desc    Approve or reject chef application
// @access  Private (Admin only)
router.put('/chefs/:id/approve', async (req, res) => {
  try {
    const { status, reviewNotes, reviewedBy } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    const chef = await Chef.findByIdAndUpdate(
      req.params.id,
      {
        'verification.status': status,
        'verification.reviewedAt': new Date(),
        'verification.reviewedBy': reviewedBy || 'Admin',
        'verification.reviewNotes': reviewNotes || '',
        isApproved: status === 'approved'
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef not found'
      });
    }

    return res.json({
      success: true,
      message: `Chef application ${status} successfully`,
      data: { chef }
    });
  } catch (error) {
    console.error('Approve chef error:', error);
    const err = error as any;
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    return res.status(500).json({
      success: false,
      message: `Error processing chef application: ${err.message || 'Unknown error'}`
    });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders for admin view
// @access  Private (Admin only)
router.get('/orders', async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(filter)
      .populate('customerId', 'name email')
      .populate('chefId', 'businessName')
      .populate('items.productId', 'name price')
      .sort({ 'timeline.placedAt': -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Order.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users for admin management
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const { role, isActive, limit = 50, page = 1 } = req.query;
    const filter: any = {};

    if (role) {
      filter.role = role;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await User.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin only)
router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
});

export default router; 