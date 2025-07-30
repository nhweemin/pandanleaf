import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Vendor from '../models/Vendor';

const router = express.Router();

// Generate JWT token
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'junior', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password, // Password will be hashed by the pre-save middleware
      role: role || 'customer',
      phone
    });

    await user.save();

    // Generate token
    const token = generateToken((user._id as string).toString());

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Database authentication with real users
    try {
      const user = await User.findOne({ email }).select('+password');
      if (user) {
        const isPasswordValid = await user.comparePassword(password);
        if (isPasswordValid) {
          const token = generateToken((user._id as string).toString());

                // Auto-create vendor profile for business_owner users if it doesn't exist
      if (user.role === 'business_owner') {
        const existingVendor = await Vendor.findOne({ userId: user._id });
        if (!existingVendor) {
          console.log('🏪 Auto-creating vendor profile for business_owner:', user.email);
          const vendor = new Vendor({
            userId: user._id,
            businessName: `${user.name}'s Business`,
            businessType: 'restaurant',
            description: 'Welcome to our business! We provide quality products and services.',
            location: {
              address: '123 Business Street',
              city: 'Singapore',
              state: 'Singapore',
              zipCode: '123456',
              coordinates: {
                latitude: 1.3521,
                longitude: 103.8198
              }
            },
            contact: {
              phone: '+6512345678',
              email: user.email
            },
            businessInfo: {
              yearsOfExperience: 2,
              specialties: ['Quality Service', 'Customer Satisfaction']
            },
            portfolio: {
              images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300'],
              description: 'Our business portfolio'
            },
            verification: {
              status: 'approved',
              documents: []
            },
            ratings: {
              average: 4.5,
              count: 0
            },
            isApproved: true,
            isActive: true
          });
          await vendor.save();
          console.log('✅ Auto-created vendor profile for:', user.email);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
        }
      }
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error during authentication'
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid credentials'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // This would typically use authentication middleware to get user from token
    res.status(200).json({
      success: true,
      data: {
        user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'customer' }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router; 