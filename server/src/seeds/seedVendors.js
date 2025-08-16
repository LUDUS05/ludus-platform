const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const vendorData = [
  {
    businessName: 'Riyadh Fitness Studio',
    description: 'Premium fitness studio offering personalized training sessions, group classes, and wellness programs in the heart of Riyadh. Our certified trainers help you achieve your fitness goals with state-of-the-art equipment.',
    contactInfo: {
      email: 'info@riyadhfitness.com',
      phone: '+966-11-456-7890',
      website: 'https://riyadhfitness.com',
      socialMedia: {
        instagram: '@riyadhfitness',
        twitter: '@riyadhfitness'
      }
    },
    location: {
      address: 'King Fahd Road, Al Olaya District',
      city: 'Riyadh',
      state: 'Riyadh Province',
      zipCode: '11564',
      coordinates: [46.6753, 24.7136]
    },
    categories: ['fitness', 'wellness'],
    credentials: {
      licenses: ['Health Club License - RYD2024001'],
      certifications: ['ACSM Certified', 'Saudi Health Ministry Approved']
    },
    businessHours: [
      { day: 'sunday', isOpen: true, openTime: '06:00', closeTime: '22:00' },
      { day: 'monday', isOpen: true, openTime: '06:00', closeTime: '22:00' },
      { day: 'tuesday', isOpen: true, openTime: '06:00', closeTime: '22:00' },
      { day: 'wednesday', isOpen: true, openTime: '06:00', closeTime: '22:00' },
      { day: 'thursday', isOpen: true, openTime: '06:00', closeTime: '22:00' },
      { day: 'friday', isOpen: true, openTime: '14:00', closeTime: '22:00' },
      { day: 'saturday', isOpen: true, openTime: '08:00', closeTime: '22:00' }
    ]
  },
  {
    businessName: 'Saudi Traditional Arts Center',
    description: 'Learn authentic Saudi traditional arts including calligraphy, pottery, and traditional crafts. Our master artisans teach time-honored techniques passed down through generations.',
    contactInfo: {
      email: 'contact@saudiarts.sa',
      phone: '+966-11-567-8901',
      website: 'https://saudiarts.sa'
    },
    location: {
      address: 'Diriyah Historic District',
      city: 'Riyadh',
      state: 'Riyadh Province',
      zipCode: '13714',
      coordinates: [46.5731, 24.7324]
    },
    categories: ['arts'],
    credentials: {
      licenses: ['Cultural Arts License - RYD2024002'],
      certifications: ['Ministry of Culture Certified']
    },
    businessHours: [
      { day: 'sunday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'friday', isOpen: false },
      { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '17:00' }
    ]
  },
  {
    businessName: 'Desert Culinary Academy',
    description: 'Master the art of Saudi and Middle Eastern cuisine with our expert chefs. From traditional Kabsa to modern fusion dishes, learn authentic cooking techniques and recipes.',
    contactInfo: {
      email: 'info@desertculinary.com',
      phone: '+966-11-678-9012',
      website: 'https://desertculinary.com',
      socialMedia: {
        instagram: '@desertculinary',
        youtube: 'Desert Culinary Academy'
      }
    },
    location: {
      address: 'Prince Mohammed Bin Abdulaziz Road',
      city: 'Riyadh',
      state: 'Riyadh Province',
      zipCode: '12244',
      coordinates: [46.6841, 24.7507]
    },
    categories: ['food'],
    credentials: {
      licenses: ['Food Service License - RYD2024003'],
      certifications: ['HACCP Certified', 'Saudi Food & Drug Authority Approved']
    },
    businessHours: [
      { day: 'sunday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { day: 'monday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { day: 'tuesday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { day: 'wednesday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { day: 'thursday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { day: 'friday', isOpen: true, openTime: '15:00', closeTime: '20:00' },
      { day: 'saturday', isOpen: true, openTime: '10:00', closeTime: '20:00' }
    ]
  },
  {
    businessName: 'Riyadh Adventure Tours',
    description: 'Explore the natural beauty around Riyadh with guided hiking, desert camping, and outdoor adventure experiences. Perfect for beginners and experienced adventurers alike.',
    contactInfo: {
      email: 'tours@riyadhadventure.sa',
      phone: '+966-11-789-0123',
      website: 'https://riyadhadventure.sa',
      socialMedia: {
        instagram: '@riyadhadventure',
        facebook: 'RiyadhAdventureTours'
      }
    },
    location: {
      address: 'Exit 10, Riyadh-Dammam Highway',
      city: 'Riyadh',
      state: 'Riyadh Province',
      zipCode: '13321',
      coordinates: [46.8542, 24.6408]
    },
    categories: ['outdoor'],
    credentials: {
      licenses: ['Tourism License - RYD2024004'],
      certifications: ['Saudi Commission for Tourism Certified', 'Wilderness First Aid Certified']
    },
    businessHours: [
      { day: 'sunday', isOpen: true, openTime: '05:00', closeTime: '19:00' },
      { day: 'monday', isOpen: true, openTime: '05:00', closeTime: '19:00' },
      { day: 'tuesday', isOpen: true, openTime: '05:00', closeTime: '19:00' },
      { day: 'wednesday', isOpen: true, openTime: '05:00', closeTime: '19:00' },
      { day: 'thursday', isOpen: true, openTime: '05:00', closeTime: '19:00' },
      { day: 'friday', isOpen: true, openTime: '05:00', closeTime: '19:00' },
      { day: 'saturday', isOpen: true, openTime: '05:00', closeTime: '19:00' }
    ]
  },
  {
    businessName: 'Wellness Oasis Spa',
    description: 'Rejuvenate your mind and body with traditional Arabian wellness treatments, modern spa therapies, and holistic healing practices in a serene environment.',
    contactInfo: {
      email: 'relax@wellnessoasis.sa',
      phone: '+966-11-890-1234',
      website: 'https://wellnessoasis.sa'
    },
    location: {
      address: 'King Abdullah Financial District',
      city: 'Riyadh',
      state: 'Riyadh Province',
      zipCode: '13519',
      coordinates: [46.6252, 24.7691]
    },
    categories: ['wellness'],
    credentials: {
      licenses: ['Spa & Wellness License - RYD2024005'],
      certifications: ['International Spa Association Member']
    },
    businessHours: [
      { day: 'sunday', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { day: 'friday', isOpen: true, openTime: '14:00', closeTime: '21:00' },
      { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '21:00' }
    ]
  }
];

const seedVendors = async () => {
  try {
    console.log('🌱 Starting vendor seeding...');

    // Find admin user to associate vendors with
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      throw new Error('Admin user not found. Please run seedAdmin first.');
    }

    // Clear existing vendors
    await Vendor.deleteMany({});
    console.log('🗑️  Cleared existing vendors');

    // Create vendors
    const vendors = [];
    for (const vendorInfo of vendorData) {
      const vendor = new Vendor({
        ...vendorInfo,
        createdBy: adminUser._id,
        bankingInfo: {
          accountStatus: 'pending' // Will be updated when Moyasar accounts are set up
        }
      });
      
      await vendor.save();
      vendors.push(vendor);
      console.log(`✅ Created vendor: ${vendor.businessName}`);
    }

    console.log(`🎉 Successfully created ${vendors.length} vendors`);
    return vendors;
    
  } catch (error) {
    console.error('❌ Error seeding vendors:', error.message);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');
      
      await seedVendors();
      
      console.log('🎉 Vendor seeding completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('💥 Vendor seeding failed:', error);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    }
  })();
}

module.exports = seedVendors;