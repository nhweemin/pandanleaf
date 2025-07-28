import express from 'express';
import Product from '../models/Product';
import Vendor from '../models/Vendor';

const router = express.Router();

// @route   POST /api/products/test
// @desc    Test endpoint to verify backend changes
// @access  Public
router.post('/test', async (req, res) => {
  console.log('🧪 TEST ENDPOINT HIT:', req.body);
  return res.json({
    success: true,
    message: 'Backend is working with latest changes!',
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

// @route   GET /api/products
// @desc    Get all active products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { isActive: true, 'availability.isAvailable': true };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.vendorId) {
      filter.vendorId = req.query.vendorId;
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }

    // Get products with vendor info
    const products = await Product.find(filter)
      .populate('vendorId', 'businessName businessType location ratings')
      .sort({ 'ratings.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendorId', 'businessName businessType location contact ratings');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Vendor only)
router.post('/', async (req, res) => {
  try {
    console.log('🔍 PRODUCT CREATION FOR VENDOR:', {
      name: req.body.name,
      description: req.body.description,
      vendorId: req.body.vendorId
    });

    const { vendorId, name, description, category, price, images } = req.body;

    if (!name || !description || !vendorId || !price) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields. Got: name=${!!name}, description=${!!description}, vendorId=${!!vendorId}, price=${!!price}`
      });
    }

    // Verify vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    console.log('✅ CREATING PRODUCT FOR VENDOR:', { name, description, price });
    const product = new Product({
      vendorId,
      name: name.trim(),
      description: description.trim(),
      category: category || 'Other',
      images: images || [],
      price: Number(price),
      currency: 'USD',
      availability: {
        isAvailable: true,
        maxOrdersPerDay: 10,
        advanceOrderDays: 0
      },
      tags: [],
      specifications: {},
      ratings: {
        average: 0,
        count: 0
      }
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    const err = error as any;
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    return res.status(500).json({
      success: false,
      message: `Error creating product: ${err.message || 'Unknown error'}`
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Vendor owner)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Vendor owner or Admin)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
});

export default router; 