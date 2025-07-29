import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Generate JWT token
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'junior', {
    expiresIn: '30d',
  });
};

// Simple test authentication endpoint - NO DATABASE REQUIRED
router.post('/simple-login', (req, res) => {
  try {
    console.log('🧪 SIMPLE LOGIN ATTEMPT:', req.body);
    
    const { email, password } = req.body;

    // Hardcoded test users - no database needed
    const testUsers: Record<string, any> = {
      'admin@pandanleaf.com': { id: 'test-admin', name: 'Admin User', role: 'admin', password: 'test123' },
      'indah@pandanleaf.com': { id: 'test-chef', name: 'Indah Sari', role: 'chef', password: 'test123' },
      'customer@pandanleaf.com': { id: 'test-customer', name: 'Customer User', role: 'customer', password: 'test123' },
      'admin@homechef.com': { id: 'test-admin-legacy', name: 'Admin User', role: 'admin', password: 'test123' },
      'indah@homechef.com': { id: 'test-chef-legacy', name: 'Indah Sari', role: 'chef', password: 'test123' },
      'customer@homechef.com': { id: 'test-customer-legacy', name: 'Customer User', role: 'customer', password: 'test123' }
    };

    console.log(`🔍 Looking for user: ${email}`);
    
    if (testUsers[email] && testUsers[email].password === password) {
      const user = testUsers[email];
      const token = generateToken(user.id);
      
      console.log(`✅ SIMPLE LOGIN SUCCESS: ${email} (${user.role})`);
      
      return res.status(200).json({
        success: true,
        message: 'Simple login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: email,
            role: user.role
          },
          token
        }
      });
    }

    console.log(`❌ SIMPLE LOGIN FAILED: ${email} - invalid credentials`);
    return res.status(400).json({
      success: false,
      message: 'Invalid credentials'
    });

  } catch (error) {
    console.error('❌ SIMPLE LOGIN ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Simple login error'
    });
  }
});

// Test endpoint
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Simple test auth is working!',
    timestamp: new Date().toISOString()
  });
});

export default router; 