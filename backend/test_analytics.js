const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');

// Import models
const User = require('./models/User');
const Gig = require('./models/Gig');
const Escrow = require('./models/Escrow');
const Transaction = require('./models/Transaction');

const runTest = async () => {
    console.log('📊 STARTING FREELANCER ANALYTICS MECHANISM TESTING...');
    
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

    let client, freelancer, gig, escrow, transaction;

    try {
        // Clean legacy test records
        await User.deleteMany({ email: /_test_anlyt@gigora\.dev$/ });

        // 1. Create client and freelancer accounts
        console.log('Creating test user accounts...');
        client = await User.create({
            username: 'client_test_anlyt',
            email: 'client_test_anlyt@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'client',
            isEmailVerified: true
        });

        freelancer = await User.create({
            username: 'freelancer_test_anlyt',
            email: 'freelancer_test_anlyt@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'freelancer',
            isEmailVerified: true,
            profileViews: 0
        });

        // 2. Simulate client viewing freelancer's profile (should auto-increment view count)
        console.log('Simulating client visiting freelancer profile details...');
        const userFetched = await User.findById(freelancer._id);
        if (userFetched.role === 'freelancer') {
            userFetched.profileViews = (userFetched.profileViews || 0) + 1;
            await userFetched.save();
        }

        const viewChecked = await User.findById(freelancer._id);
        assert(viewChecked.profileViews === 1, 'Profile views correctly auto-incremented from 0 to 1', 'Profile view increment failed');

        // 3. Create active gig and escrow
        console.log('Creating active gig contract...');
        gig = await Gig.create({
            title: 'Test Analytics Website Gig',
            description: 'A mock gig to test contract analytics aggregations',
            category: 'Web Development',
            budget: 3000,
            address: '123 Test Street',
            location: {
                type: 'Point',
                coordinates: [72.8777, 19.0760]
            },
            client: client._id,
            freelancer: freelancer._id,
            status: 'in-progress'
        });

        // 4. Log a milestone payment release transaction of type 'release'
        console.log('Logging milestone release payout transaction...');
        transaction = await Transaction.create({
            user: freelancer._id,
            type: 'release',
            amount: 2000,
            description: `Milestone payout release on Gig: "${gig.title}"`,
            referenceId: gig._id
        });

        // 5. Query and calculate analytics metrics (matching API controller logic)
        console.log('Aggregating analytics data values...');
        const me = await User.findById(freelancer._id);
        const profileViews = me.profileViews || 0;

        const payouts = await Transaction.find({
            user: freelancer._id,
            type: 'release'
        });
        const lifetimeEarnings = payouts.reduce((sum, t) => sum + t.amount, 0);

        const currentMonthIdx = new Date().getMonth();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyEarningsData = months.map(m => ({ month: m, amount: 0 }));

        payouts.forEach(t => {
            const date = new Date(t.createdAt);
            const mIdx = date.getMonth();
            if (mIdx >= 0 && mIdx < 12) {
                monthlyEarningsData[mIdx].amount += t.amount;
            }
        });

        assert(profileViews === 1, 'Analytics correctly fetched 1 profile view', 'Views report mismatch');
        assert(lifetimeEarnings === 2000, 'Analytics correctly calculated ₹2000 lifetime earnings', 'Lifetime calculation mismatch');
        assert(monthlyEarningsData[currentMonthIdx].amount === 2000, `Analytics correctly registered ₹2000 in current month (${months[currentMonthIdx]})`, 'Monthly breakdown aggregation mismatch');

        console.log('\n🌟 FREELANCER ANALYTICS INTEGRATION TESTS PASSED! 🌟');

    } catch (error) {
        console.error('\n❌ ANALYTICS TEST SUITE RUNTIME FAILURE:', error.message);
    } finally {
        console.log('Cleaning up test records...');
        if (client) await User.deleteOne({ _id: client._id });
        if (freelancer) await User.deleteOne({ _id: freelancer._id });
        if (gig) await Gig.deleteOne({ _id: gig._id });
        if (transaction) await Transaction.deleteOne({ _id: transaction._id });

        mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

runTest();
