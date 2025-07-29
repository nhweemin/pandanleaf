import express from 'express';
import Chef from '../models/Chef';
import User from '../models/User';
import Product from '../models/Product';

const router = express.Router();

// @route   GET /api/chefs
// @desc    Get all approved chefs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { location, cuisine, rating, limit = 20, page = 1 } = req.query;
    const filter: any = { isActive: true, isApproved: true };

    // Apply filters
    if (location) {
      filter['serviceArea.cities'] = { $in: [location] };
    }
    if (cuisine) {
      filter.specialties = { $in: [cuisine] };
    }
    if (rating) {
      filter['rating.average'] = { $gte: Number(rating) };
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get chefs with user information
    const chefs = await Chef.find(filter)
      .populate('userId', 'name email avatar')
      .sort({ 'rating.average': -1, createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Chef.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        chefs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get chefs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching chefs'
    });
  }
});

// @route   GET /api/chefs/:id
// @desc    Get chef by ID with products
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const chef = await Chef.findById(req.params.id)
      .populate('userId', 'name email avatar');

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef not found'
      });
    }

    // Get chef's products
    const products = await Product.find({ 
      chefId: chef._id, 
      isActive: true,
      'availability.isAvailable': true 
    }).sort({ 'rating.average': -1 });

    return res.json({
      success: true,
      data: { 
        chef,
        products
      }
    });
  } catch (error) {
    console.error('Get chef error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching chef'
    });
  }
});

// @route   POST /api/chefs
// @desc    Create chef profile
// @access  Private (User with chef role)
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      businessName,
      description,
      specialties,
      experience,
      certifications,
      kitchenPhotos,
      serviceArea,
      pricing,
      availability
    } = req.body;

    // Verify user exists and has chef role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'business_owner') {
      return res.status(403).json({
        success: false,
        message: 'User must have chef role'
      });
    }

    // Check if chef profile already exists
    const existingChef = await Chef.findOne({ userId });
    if (existingChef) {
      return res.status(400).json({
        success: false,
        message: 'Chef profile already exists'
      });
    }

    // Create chef profile
    const chef = new Chef({
      userId,
      businessName,
      description,
      specialties,
      experience,
      certifications,
      kitchenPhotos,
      serviceArea,
      pricing,
      availability,
      verification: {
        status: 'pending',
        submittedAt: new Date()
      }
    });

    await chef.save();

    return res.status(201).json({
      success: true,
      message: 'Chef profile created successfully',
      data: { chef }
    });
  } catch (error) {
    console.error('Create chef error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating chef profile'
    });
  }
});

// @route   PUT /api/chefs/:id
// @desc    Update chef profile
// @access  Private (Chef only)
router.put('/:id', async (req, res) => {
  try {
    const chef = await Chef.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef not found'
      });
    }

    return res.json({
      success: true,
      message: 'Chef profile updated successfully',
      data: { chef }
    });
  } catch (error) {
    console.error('Update chef error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating chef profile'
    });
  }
});

// @route   GET /api/chefs/:id/products
// @desc    Get products by chef
// @access  Public
router.get('/:id/products', async (req, res) => {
  try {
    const products = await Product.find({ 
      chefId: req.params.id,
      isActive: true 
    }).sort({ 'rating.average': -1, createdAt: -1 });

    return res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Get chef products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching chef products'
    });
  }
});

// @route   DELETE /api/chefs/:id
// @desc    Delete chef profile
// @access  Private (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const chef = await Chef.findByIdAndDelete(req.params.id);

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef not found'
      });
    }

    return res.json({
      success: true,
      message: 'Chef profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete chef error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting chef profile'
    });
  }
});

export default router; 