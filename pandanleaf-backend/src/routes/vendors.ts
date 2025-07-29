import express from 'express';
import Vendor from '../models/Vendor';
import Product from '../models/Product';
import User from '../models/User';

const router = express.Router();

// @route   GET /api/vendors
// @desc    Get all approved vendors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter: any = { isApproved: true, isActive: true };
    
    if (req.query.businessType) {
      filter.businessType = req.query.businessType;
    }
    
    if (req.query.city) {
      filter['location.city'] = new RegExp(req.query.city as string, 'i');
    }

    // Get vendors with user information
    const vendors = await Vendor.find(filter)
      .populate('userId', 'name email')
      .sort({ 'ratings.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Vendor.countDocuments(filter);

    res.json({
      success: true,
      data: {
        vendors,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalVendors: total
        }
      }
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors'
    });
  }
});

// @route   GET /api/vendors/:id
// @desc    Get vendor by ID with products
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('userId', 'name email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Get vendor's products
    const products = await Product.find({
      vendorId: vendor._id,
      isActive: true
    });

    return res.json({
      success: true,
      data: {
        vendor,
        products
      }
    });
  } catch (error) {
    console.error('Get vendor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching vendor'
    });
  }
});

// @route   POST /api/vendors
// @desc    Create vendor profile
// @access  Private (User with vendor role)
router.post('/', async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      description,
      location,
      contact,
      businessInfo,
      portfolio
    } = req.body;

    // Get user ID from token (from req.body for now, in production use middleware)
    const userId = req.body.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Verify user exists and has appropriate role (using chef for compatibility)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'business_owner') { // Use business_owner role
      return res.status(403).json({
        success: false,
        message: 'User must have business owner role'
      });
    }

    // Check if vendor profile already exists
    const existingVendor = await Vendor.findOne({ userId });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'Vendor profile already exists'
      });
    }

    // Create vendor profile
    const vendor = new Vendor({
      userId,
      businessName,
      businessType,
      description,
      location,
      contact,
      businessInfo,
      portfolio,
      verification: {
        status: 'pending',
        documents: []
      }
    });

    await vendor.save();

    return res.status(201).json({
      success: true,
      message: 'Vendor profile created successfully',
      data: { vendor }
    });
  } catch (error) {
    console.error('Create vendor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating vendor profile'
    });
  }
});

// @route   PUT /api/vendors/:id
// @desc    Update vendor profile
// @access  Private (Vendor only)
router.put('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    return res.json({
      success: true,
      message: 'Vendor profile updated successfully',
      data: { vendor }
    });
  } catch (error) {
    console.error('Update vendor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating vendor profile'
    });
  }
});

// @route   DELETE /api/vendors/:id
// @desc    Delete vendor profile
// @access  Private (Admin or Vendor owner)
router.delete('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Also delete all products by this vendor
    await Product.deleteMany({ vendorId: vendor._id });

    return res.json({
      success: true,
      message: 'Vendor profile and products deleted successfully'
    });
  } catch (error) {
    console.error('Delete vendor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting vendor profile'
    });
  }
});

// @route   GET /api/vendors/:id/products
// @desc    Get products by vendor
// @access  Public
router.get('/:id/products', async (req, res) => {
  try {
    const products = await Product.find({
      vendorId: req.params.id,
      isActive: true
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Get vendor products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching vendor products'
    });
  }
});

export default router; 