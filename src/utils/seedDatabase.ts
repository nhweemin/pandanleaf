import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Chef from '../models/Chef';
import Vendor from '../models/Vendor';

// Test users to create in the database
const testUsers = [
  {
    name: 'Admin User',
    email: 'admin@pandanleaf.com',
    password: 'test123',
    role: 'admin',
    phone: '+1234567890',
    isVerified: true,
    isActive: true
  },
  {
    name: 'Indah Sari',
    email: 'indah@pandanleaf.com', 
    password: 'test123',
    role: 'chef',
    phone: '+1234567891',
    isVerified: true,
    isActive: true
  },
  {
    name: 'Customer User',
    email: 'customer@pandanleaf.com',
    password: 'test123', 
    role: 'customer',
    phone: '+1234567892',
    isVerified: true,
    isActive: true
  },
  // Legacy email variants for backward compatibility
  {
    name: 'Admin User (Legacy)',
    email: 'admin@homechef.com',
    password: 'test123',
    role: 'admin',
    phone: '+1234567893',
    isVerified: true,
    isActive: true
  },
  {
    name: 'Indah Sari (Legacy)',
    email: 'indah@homechef.com',
    password: 'test123',
    role: 'chef', 
    phone: '+1234567894',
    isVerified: true,
    isActive: true
  },
  {
    name: 'Customer User (Legacy)',
    email: 'customer@homechef.com',
    password: 'test123',
    role: 'customer',
    phone: '+1234567895',
    isVerified: true,
    isActive: true
  }
];

export const seedTestUsers = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if users already exist
    const existingUserCount = await User.countDocuments({
      email: { $in: testUsers.map(u => u.email) }
    });

    if (existingUserCount > 0) {
      console.log('✅ Test users already exist in database, skipping seeding');
      return;
    }

    // Create test users
    const createdUsers = [];
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⏭️  User ${userData.email} already exists, skipping`);
        createdUsers.push(existingUser);
        continue;
      }

      // Hash password before saving (the User model's pre-save hook will do this)
      const user = new User(userData);
      await user.save();
      
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      createdUsers.push(user);

      // Create chef profile for chef users
      if (userData.role === 'chef') {
        const existingChef = await Chef.findOne({ userId: user._id });
        if (!existingChef) {
          const chef = new Chef({
            userId: user._id,
            businessName: `${userData.name}'s Kitchen`,
            cuisine: ['Indonesian', 'Asian'],
            description: 'Authentic homemade Indonesian cuisine with love and tradition.',
            specialties: ['Rendang', 'Nasi Gudeg', 'Ayam Penyet'],
            isVerified: true,
            isActive: true,
            rating: 4.8,
            totalOrders: 150,
            responseTime: 30,
            location: {
              address: '123 Food Street',
              city: 'Singapore',
              postalCode: '123456',
              coordinates: {
                latitude: 1.3521,
                longitude: 103.8198
              }
            }
          });
          await chef.save();
          console.log(`👨‍🍳 Created chef profile for: ${userData.email}`);
        }
      }

      // Create vendor profile for chef users (since chefs are also vendors)
      if (userData.role === 'chef') {
        const existingVendor = await Vendor.findOne({ userId: user._id });
        if (!existingVendor) {
          const vendor = new Vendor({
            userId: user._id,
            businessName: `${userData.name}'s Kitchen`,
            businessType: 'restaurant',
            contactEmail: userData.email,
            contactPhone: userData.phone,
            isVerified: true,
            isActive: true,
            rating: 4.8,
            totalSales: 25000
          });
          await vendor.save();
          console.log(`🏪 Created vendor profile for: ${userData.email}`);
        }
      }
    }

    console.log(`🎉 Database seeding completed! Created ${createdUsers.length} test users.`);
    
    // Log the test accounts for easy reference
    console.log('\n📋 TEST ACCOUNTS AVAILABLE:');
    testUsers.forEach(user => {
      console.log(`   ${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

export default seedTestUsers; 