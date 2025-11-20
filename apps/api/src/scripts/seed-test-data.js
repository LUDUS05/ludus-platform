const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');
const PaymentEnhanced = require('../models/PaymentEnhanced');
const Like = require('../models/Like');
const { connectDB } = require('../config/database');

const seedData = async () => {
    try {
        console.log('🌱 Starting seed process...');
        await connectDB();

        // 1. Create Test User
        console.log('Creating test user...');
        const user = await User.findOneAndUpdate(
            { email: 'test@example.com' },
            {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'password123', // In a real app, this should be hashed
                role: 'user',
                preferences: {
                    categories: ['fitness', 'outdoor'],
                    languages: ['en']
                }
            },
            { upsert: true, new: true }
        );
        console.log(`User created: ${user._id}`);

        // 2. Create Test Vendor
        console.log('Creating test vendor...');
        const vendor = await Vendor.findOneAndUpdate(
            { slug: 'test-vendor' },
            {
                businessName: 'Test Vendor',
                slug: 'test-vendor',
                description: 'A test vendor for development',
                contactInfo: { email: 'vendor@example.com' },
                categories: ['fitness'],
                createdBy: user._id
            },
            { upsert: true, new: true }
        );
        console.log(`Vendor created: ${vendor._id}`);

        // 3. Create Test Activity
        console.log('Creating test activity...');
        const activity = await Activity.findOneAndUpdate(
            { slug: 'test-activity' },
            {
                title: 'Test Activity',
                slug: 'test-activity',
                description: 'A fun test activity',
                shortDescription: 'Fun test',
                vendor: vendor._id,
                category: 'fitness',
                pricing: { basePrice: 100 },
                capacity: { max: 10 },
                location: { city: 'Riyadh', coordinates: [46.6753, 24.7136] },
                createdBy: user._id,
                isActive: true
            },
            { upsert: true, new: true }
        );
        console.log(`Activity created: ${activity._id}`);

        // 4. Create Test Booking
        console.log('Creating test booking...');
        const booking = await Booking.create({
            user: user._id,
            activity: activity._id,
            vendor: vendor._id,
            bookingDate: new Date(),
            timeSlot: { startTime: '10:00', endTime: '11:00' },
            participants: { count: 1, details: [{ name: 'Test User' }] },
            pricing: { basePrice: 100, totalPrice: 100 },
            payment: {
                moyasarPaymentId: 'pay_test_123',
                status: 'paid',
                method: 'credit_card'
            },
            status: 'completed',
            contactInfo: { email: 'test@example.com' }
        });
        console.log(`Booking created: ${booking._id}`);

        // 5. Create Test Payment
        console.log('Creating test payment...');
        await PaymentEnhanced.create({
            paymentNumber: `PAY-${Date.now()}`,
            booking: { id: booking._id, bookingNumber: booking.bookingId },
            user: { id: user._id, name: 'Test User', email: 'test@example.com' },
            amount: 100,
            method: 'moyasar',
            gateway: { provider: 'moyasar', transactionId: 'pay_test_123' },
            status: 'completed',
            processedAt: new Date(),
            completedAt: new Date()
        });
        console.log('Payment created');

        // 6. Create Test Favorite
        console.log('Creating test favorite...');
        await Like.findOneAndUpdate(
            { user: user._id, contentId: activity._id },
            {
                user: user._id,
                contentId: activity._id,
                contentType: 'activity'
            },
            { upsert: true }
        );
        console.log('Favorite created');

        console.log('✅ Seed process completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed process failed:', error);
        process.exit(1);
    }
};

seedData();
