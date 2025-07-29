import express from 'express';
import User from '../models/User';

const router = express.Router();

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

    res.status(200).json({
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
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: (error as Error).message
    });
  }
});

export default router; 