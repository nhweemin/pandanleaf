import express from 'express';
import User from '../models/User';
import Chef from '../models/Chef';
import Vendor from '../models/Vendor';
import Product from '../models/Product';
import Order from '../models/Order';

const router = express.Router();

// Create new test user endpoint
router.post('/create-test-user', async (req, res) => {
  try {
    const { name, email, password = 'test123', role = 'business_owner' } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const userData = {
      name,
      email,
      password,
      role,
      phone: '+1234567899',
      isVerified: true,
      isActive: true
    };

    const user = new User(userData);
    await user.save();

    console.log(`✅ Created test user: ${email} (${role})`);

    // Create chef profile for business owners
    if (role === 'business_owner') {
      const chef = new Chef({
        userId: user._id,
        businessName: `${name}'s Business`,
        cuisine: ['International', 'Fusion'],
        description: 'Fresh test business with quality products and services.',
        specialties: ['Custom Orders', 'Quality Service', 'Fast Delivery'],
        isVerified: true,
        isActive: true,
        rating: 4.9,
        totalOrders: 50,
        responseTime: 15,
        experience: 3,
        availability: {
          hours: {
            start: '08:00',
            end: '22:00'
          }
        },
        pricing: {
          minimumOrder: 12.00,
          deliveryFee: 2.99
        },
        serviceArea: {
          radius: 15
        },
        kitchenPhotos: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300', 'https://images.unsplash.com/photo-1556909835-9dff1c0dc3e5?w=300'],
        location: {
          address: '456 Business Avenue',
          city: 'Singapore',
          postalCode: '123789',
          coordinates: {
            latitude: 1.3521,
            longitude: 103.8198
          }
        }
      });
      await chef.save();
      console.log(`👨‍🍳 Created chef profile for: ${email}`);

      // Create vendor profile
      const vendor = new Vendor({
        userId: user._id,
        businessName: `${name}'s Business`,
        businessType: 'restaurant',
        contactEmail: email,
        contactPhone: '+1234567899',
        isVerified: true,
        isActive: true,
        rating: 4.9,
        totalSales: 15000
      });
      await vendor.save();
      console.log(`🏪 Created vendor profile for: ${email}`);
    }

    return res.status(201).json({
      success: true,
      message: `Test user created successfully`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error creating test user:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: (error as Error).message
    });
  }
});

// Temporary endpoint to update user roles for testing
router.post('/update-user-role', async (req, res) => {
  try {
    const { email, newRole } = req.body;

    if (!email || !newRole) {
      return res.status(400).json({
        success: false,
        message: 'Email and newRole are required'
      });
    }

    // Find and update the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldRole = user.role;
    user.role = newRole as any;
    await user.save();

    console.log(`✅ Updated ${email} role from ${oldRole} to ${newRole}`);

    return res.status(200).json({
      success: true,
      message: `Updated ${email} role from ${oldRole} to ${newRole}`,
      data: {
        email: user.email,
        name: user.name,
        oldRole,
        newRole
      }
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: (error as Error).message
    });
  }
});

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