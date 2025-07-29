import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

// 🧪 TEST ROUTE: Verify new authentication code is deployed
router.get('/test-auth-version', (req, res) => {
  res.json({
    success: true,
    message: 'NEW AUTHENTICATION CODE IS ACTIVE',
    timestamp: new Date().toISOString(),
    testUsers: ['admin@pandanleaf.com', 'indah@pandanleaf.com', 'customer@pandanleaf.com']
  });
});

// Generate JWT token
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'junior', {
    expiresIn: '30d',
  });
}; 