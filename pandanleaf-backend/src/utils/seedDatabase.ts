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
    role: 'business_owner',
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
    role: 'business_owner', 
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

         // Update existing users with new roles if needed
     const existingIndahUsers = await User.find({ 
       email: { $in: ['indah@pandanleaf.com', 'indah@homechef.com'] } 
     });

     if (existingIndahUsers.length > 0) {
       console.log('🔄 Updating existing Indah users to business_owner role...');
       for (const user of existingIndahUsers) {
         if (user.role !== 'business_owner') {
           user.role = 'business_owner' as any; // Type assertion needed for enum
           await user.save();
           console.log(`✅ Updated ${user.email} role to business_owner`);
         }
       }
     }

    // Check if users already exist
    const existingUserCount = await User.countDocuments({
      email: { $in: testUsers.map(u => u.email) }
    });

    if (existingUserCount === testUsers.length) {
      console.log('✅ All test users exist in database. Role updates completed.');
      return;
    }

    // Create test users
    const createdUsers = [];
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⏭️  User ${userData.email} already exists, skipping creation`);
        createdUsers.push(existingUser);
        continue;
      }

      // Hash password before saving (the User model's pre-save hook will do this)
      const user = new User(userData);
      await user.save();
      
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      createdUsers.push(user);

      // Create chef profile for business owners
      if (userData.role === 'business_owner') {
        const existingChef = await Chef.findOne({ userId: user._id });
        if (!existingChef) {
          const chef = new Chef({
            userId: user._id,
            businessName: `${userData.name}'s Business`,
            cuisine: ['Indonesian', 'Asian'],
            description: 'Authentic homemade Indonesian cuisine with love and tradition.',
            specialties: ['Rendang', 'Nasi Gudeg', 'Ayam Penyet'],
            isVerified: true,
            isActive: true,
            rating: 4.8,
            totalOrders: 150,
            responseTime: 30,
            experience: 5, // 5 years experience
            availability: {
              hours: {
                start: '09:00',
                end: '21:00'
              }
            },
            pricing: {
              minimumOrder: 15.00,
              deliveryFee: 3.50
            },
            serviceArea: {
              radius: 10 // 10km radius
            },
            kitchenPhotos: ['https://example.com/kitchen1.jpg', 'https://example.com/kitchen2.jpg'],
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

      // Create vendor profile for business owners
      if (userData.role === 'business_owner') {
        const existingVendor = await Vendor.findOne({ userId: user._id });
        if (!existingVendor) {
          const vendor = new Vendor({
            userId: user._id,
            businessName: `${userData.name}'s Business`,
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