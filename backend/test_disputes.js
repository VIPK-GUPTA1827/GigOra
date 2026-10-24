const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');

// Import models
const User = require('./models/User');
const Gig = require('./models/Gig');
const Escrow = require('./models/Escrow');
const Dispute = require('./models/Dispute');
const Transaction = require('./models/Transaction');

const runTest = async () => {
    console.log('⚖️ STARTING DISPUTE RESOLUTION MECHANISM TESTING...');
    
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

    let client, freelancer, admin, gig, escrow, dispute;

    try {
        // Clean legacy test records
        await User.deleteMany({ email: /_test_disp@gigora\.dev$/ });

        // 1. Create client, freelancer, and admin accounts
        console.log('Creating test user accounts...');
        client = await User.create({
            username: 'client_test_disp',
            email: 'client_test_disp@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'client',
            walletBalance: 2000,
            isEmailVerified: true
        });

        freelancer = await User.create({
            username: 'freelancer_test_disp',
            email: 'freelancer_test_disp@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'freelancer',
            walletBalance: 0,
            isEmailVerified: true
        });

        admin = await User.create({
            username: 'admin_test_disp',
            email: 'admin_test_disp@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'admin',
            isEmailVerified: true
        });

        // 2. Create active gig with in-progress state
        console.log('Creating active gig contract...');
        gig = await Gig.create({
            title: 'Test Dispute Website Gig',
            description: 'A mock gig to test contract dispute resolution',
            category: 'Web Development',
            budget: 1500,
            address: '123 Test Street',
            location: {
                type: 'Point',
                coordinates: [72.8777, 19.0760]
            },
            client: client._id,
            freelancer: freelancer._id,
            status: 'in-progress'
        });

        // 3. Setup locked escrow
        console.log('Locking client funds in Escrow contract...');
        const dummyProposalId = new mongoose.Types.ObjectId();
        escrow = await Escrow.create({
            gig: gig._id,
            proposal: dummyProposalId,
            client: client._id,
            freelancer: freelancer._id,
            amount: 1500,
            releasedAmount: 0,
            status: 'held'
        });

        // 4. Client files a dispute
        console.log('Client filing a dispute on the contract...');
        dispute = await Dispute.create({
            gig: gig._id,
            escrow: escrow._id,
            initiator: client._id,
            opponent: freelancer._id,
            reason: 'Work Incomplete',
            explanation: 'The freelancer stopped responding and did not deliver any milestones.'
        });

        gig.status = 'disputed';
        await gig.save();

        assert(dispute.status === 'open', 'Dispute recorded in "open" state', 'Dispute creation failed');
        assert(gig.status === 'disputed', 'Contract gig status locked to "disputed"', 'Gig status locking failed');

        // 5. Admin mediates: Decision = Refund Client
        console.log('Admin auditing and resolving dispute: Refund Client...');
        
        const remainingAmount = escrow.amount - escrow.releasedAmount;
        assert(remainingAmount === 1500, 'Escrow correctly has ₹1500 remaining locked funds', 'Remaining calculation mismatch');

        // Execute refund logic
        client.walletBalance += remainingAmount;
        await client.save();

        escrow.status = 'refunded';
        await escrow.save();

        await Transaction.create({
            user: client._id,
            type: 'refund',
            amount: remainingAmount,
            description: `Refund from resolved dispute on Gig: "${gig.title}"`,
            referenceId: gig._id
        });

        gig.status = 'cancelled';
        await gig.save();

        dispute.status = 'resolved';
        dispute.resolution = 'refund_client';
        dispute.resolvedBy = admin._id;
        dispute.resolvedAt = Date.now();
        await dispute.save();

        // Refetch client from DB
        const updatedClient = await User.findById(client._id);
        assert(updatedClient.walletBalance === 3500, 'Client wallet balance correctly refunded from ₹2000 to ₹3500', 'Refund transfer failed');
        assert(escrow.status === 'refunded', 'Escrow status marked as "refunded"', 'Escrow status update failed');
        assert(gig.status === 'cancelled', 'Gig contract marked as "cancelled"', 'Gig cancellation failed');
        assert(dispute.status === 'resolved', 'Dispute resolved successfully', 'Dispute resolution failed');

        console.log('\n🌟 DISPUTE RESOLUTION INTEGRATION TESTS PASSED! 🌟');

    } catch (error) {
        console.error('\n❌ DISPUTE TEST SUITE RUNTIME FAILURE:', error.message);
    } finally {
        console.log('Cleaning up test records...');
        if (client) await User.deleteOne({ _id: client._id });
        if (freelancer) await User.deleteOne({ _id: freelancer._id });
        if (admin) await User.deleteOne({ _id: admin._id });
        if (gig) await Gig.deleteOne({ _id: gig._id });
        if (escrow) await Escrow.deleteOne({ _id: escrow._id });
        if (dispute) await Dispute.deleteOne({ _id: dispute._id });
        await Transaction.deleteMany({ referenceId: gig ? gig._id : null });

        mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

runTest();
