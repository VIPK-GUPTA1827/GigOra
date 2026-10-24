const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');

// Import models
const User = require('./models/User');
const Booking = require('./models/Booking');

const runTest = async () => {
    console.log('📅 STARTING FREELANCER SCHEDULER INTEGRATION TESTING...');
    
    // Connect to database
    await connectDB();
    
    const assert = (condition, successMsg, failMsg) => {
        if (condition) {
            console.log(` ✅ SUCCESS: ${successMsg}`);
        } else {
            console.error(` ❌ FAILED: ${failMsg}`);
            throw new Error(failMsg);
        }
    };

    let client, freelancer, booking1, booking2;

    try {
        // Clean legacy test records
        await User.deleteMany({ email: /_test_sched@gigora\.dev$/ });

        // 1. Create client and freelancer profiles
        console.log('Creating test user accounts...');
        client = await User.create({
            username: 'client_test_sched',
            email: 'client_test_sched@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'client',
            isEmailVerified: true
        });

        freelancer = await User.create({
            username: 'freelancer_test_sched',
            email: 'freelancer_test_sched@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'freelancer',
            isEmailVerified: true,
            availabilitySlots: [
                { dayOfWeek: 'Monday', startTime: '09:00', endTime: '11:00' },
                { dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '16:00' }
            ]
        });
        console.log('Accounts ready. Freelancer slots set: Mondays 9-11 AM, Wednesdays 2-4 PM.');

        // 2. Client books a Monday slot
        console.log('Client booking Monday slot (09:00 - 10:00)...');
        const bookingDate = new Date('2026-07-13'); // Monday
        bookingDate.setUTCHours(0, 0, 0, 0);

        // Check for conflicts
        const conflicts = await Booking.find({
            freelancer: freelancer._id,
            date: bookingDate,
            status: { $in: ['pending', 'confirmed'] }
        });

        const slotOverlap = conflicts.some(b => {
            return '09:00' < b.endTime && '10:00' > b.startTime;
        });

        assert(slotOverlap === false, 'No initial conflict detected for 09:00 - 10:00', 'False conflict warning');

        booking1 = await Booking.create({
            freelancer: freelancer._id,
            client: client._id,
            date: bookingDate,
            startTime: '09:00',
            endTime: '10:00',
            description: 'First discussion session'
        });
        assert(booking1.status === 'pending', 'Booking request created with status "pending"', 'Booking creation failed');

        // 3. Client attempts to book conflicting slot
        console.log('Client attempting to book overlapping slot (09:30 - 10:30) on same date...');
        
        // Find conflicts on Monday
        const secondConflicts = await Booking.find({
            freelancer: freelancer._id,
            date: bookingDate,
            status: { $in: ['pending', 'confirmed'] }
        });

        const hasOverlap = secondConflicts.some(b => {
            return '09:30' < b.endTime && '10:30' > b.startTime;
        });

        assert(hasOverlap === true, 'Overlap correctly detected for conflicting slot (09:30 - 10:30)', 'Conflict check failed to intercept');

        // 4. Freelancer confirms first booking
        console.log('Freelancer accepting the booking request...');
        booking1.status = 'confirmed';
        await booking1.save();
        assert(booking1.status === 'confirmed', 'Booking status successfully updated to "confirmed"', 'Status update failed');

        // 5. Client completes the session
        console.log('Client marking booking session as completed...');
        booking1.status = 'completed';
        await booking1.save();
        assert(booking1.status === 'completed', 'Booking marked as completed', 'Status update failed');

        console.log('\n🌟 FREELANCER SCHEDULER INTEGRATION TESTS PASSED! 🌟');

    } catch (error) {
        console.error('\n❌ SCHEDULER TEST SUITE RUNTIME FAILURE:', error.message);
    } finally {
        console.log('Cleaning up test data...');
        if (client) await User.deleteOne({ _id: client._id });
        if (freelancer) await User.deleteOne({ _id: freelancer._id });
        if (booking1) await Booking.deleteOne({ _id: booking1._id });
        if (booking2) await Booking.deleteOne({ _id: booking2._id });

        mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

runTest();
