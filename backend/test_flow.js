const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');

// Import models
const User = require('./models/User');
const Gig = require('./models/Gig');
const Proposal = require('./models/Proposal');
const Escrow = require('./models/Escrow');
const Transaction = require('./models/Transaction');

const runTest = async () => {
    console.log('🚀 STARTING PLATFORM INTEGRATION TESTING...');
    
    // Connect to database
    await connectDB();
    
    // Helper to log test steps
    const step = (desc) => console.log(`\n🔹 [STEP] ${desc}`);
    const assert = (condition, successMsg, failMsg) => {
        if (condition) {
            console.log(` ✅ SUCCESS: ${successMsg}`);
        } else {
            console.error(` ❌ FAILED: ${failMsg}`);
            throw new Error(failMsg);
        }
    };

    let admin, client, freelancer, gig, proposal, escrow;

    try {
        // Clear potential legacy test records
        await User.deleteMany({ email: /_test_auth@gigora\.dev$/ });

        // 1. Create Test Accounts
        step('Creating client, freelancer, and admin test accounts...');
        admin = await User.create({
            username: 'admin_test_auth',
            email: 'admin_test_auth@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'admin',
            isEmailVerified: true
        });
        client = await User.create({
            username: 'client_test_auth',
            email: 'client_test_auth@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'client',
            walletBalance: 12000,
            isEmailVerified: true
        });
        freelancer = await User.create({
            username: 'freelancer_test_auth',
            email: 'freelancer_test_auth@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'freelancer',
            walletBalance: 0,
            isEmailVerified: true,
            isProfileComplete: true,
            skills: [{ name: 'React', level: 'Expert' }]
        });
        console.log('Account profiles generated successfully.');

        // 2. Admin verification badge toggle
        step('Admin toggles verification badge for Freelancer...');
        assert(freelancer.verificationBadge === false, 'Freelancer initially unverified', 'Freelancer verification incorrect');
        
        freelancer.verificationBadge = !freelancer.verificationBadge;
        await freelancer.save();
        assert(freelancer.verificationBadge === true, 'Verification badge successfully toggled to true', 'Verification toggle failed');

        // 3. Admin account suspension toggle
        step('Admin suspends Freelancer account...');
        assert(freelancer.isSuspended === false, 'Freelancer initially active', 'Freelancer suspension incorrect');
        
        freelancer.isSuspended = true;
        await freelancer.save();
        assert(freelancer.isSuspended === true, 'Freelancer suspended successfully', 'Suspension failed');
        
        freelancer.isSuspended = false;
        await freelancer.save();
        assert(freelancer.isSuspended === false, 'Freelancer restored/unsuspended successfully', 'Restoration failed');

        // 4. Client posts a gig with milestones
        step('Client posts a gig with 2 milestones...');
        gig = await Gig.create({
            title: 'Test Integration Contract Gig',
            description: 'Automated test suite gig details',
            category: 'Web Development',
            budget: 10000,
            client: client._id,
            status: 'open',
            address: 'Mumbai, India',
            location: {
                type: 'Point',
                coordinates: [72.8777, 19.0760]
            },
            milestones: [
                { title: 'Milestone Alpha', budget: 4000, status: 'pending' },
                { title: 'Milestone Beta', budget: 6000, status: 'pending' }
            ]
        });
        console.log(`Gig created. Milestones: M1 = ₹4000, M2 = ₹6000. Status: ${gig.status}`);

        // 5. Freelancer submits a bid/proposal
        step('Freelancer submits a bid proposal for ₹10000...');
        proposal = await Proposal.create({
            gig: gig._id,
            freelancer: freelancer._id,
            coverLetter: 'I will write robust automation tests for you.',
            bidAmount: 10000,
            estimatedTime: '3 days',
            status: 'pending'
        });
        console.log(`Bid created successfully for ₹${proposal.bidAmount}`);

        // 6. Client accepts bid (Escrow hold creation)
        step('Client accepts the bid. Placing payment in escrow hold...');
        
        // Simulating the accept bid route logic
        client.walletBalance -= proposal.bidAmount;
        await client.save();

        escrow = await Escrow.create({
            gig: gig._id,
            proposal: proposal._id,
            client: client._id,
            freelancer: freelancer._id,
            amount: proposal.bidAmount,
            status: 'held'
        });

        await Transaction.create({
            user: client._id,
            type: 'hold',
            amount: proposal.bidAmount,
            description: `Payment held in escrow for Gig: "${gig.title}"`,
            referenceId: gig._id
        });

        gig.status = 'in-progress';
        gig.freelancer = freelancer._id;
        gig.budget = proposal.bidAmount;
        await gig.save();

        // Reload data
        const updatedClient = await User.findById(client._id);
        const updatedEscrow = await Escrow.findOne({ gig: gig._id });
        
        assert(updatedClient.walletBalance === 2000, 'Client wallet balance correctly debited to ₹2000', 'Client debit failed');
        assert(updatedEscrow !== null, 'Escrow record created successfully', 'Escrow record missing');
        assert(updatedEscrow.status === 'held', 'Escrow status is set to "held"', 'Incorrect escrow status');
        assert(gig.status === 'in-progress', 'Gig status changed to "in-progress"', 'Gig status incorrect');

        // 7. Freelancer submits milestone 1 for review
        step('Freelancer submits Milestone Alpha for review...');
        const milestone1 = gig.milestones[0];
        milestone1.status = 'submitted';
        await gig.save();
        assert(gig.milestones[0].status === 'submitted', 'Milestone Alpha marked as submitted', 'Milestone submission failed');

        // 8. Client approves milestone 1 (Partial Release)
        step('Client approves Milestone Alpha. Releasing ₹4000 to Freelancer...');
        
        // Simulating approve milestone route logic
        gig.milestones[0].status = 'completed';
        await gig.save();

        const updatedEscrowRecord = await Escrow.findOne({ gig: gig._id });
        updatedEscrowRecord.releasedAmount += milestone1.budget;
        updatedEscrowRecord.status = 'partially-released';
        await updatedEscrowRecord.save();

        const updatedFreelancer = await User.findById(freelancer._id);
        updatedFreelancer.walletBalance = (updatedFreelancer.walletBalance || 0) + milestone1.budget;
        await updatedFreelancer.save();

        await Transaction.create({
            user: freelancer._id,
            type: 'release',
            amount: milestone1.budget,
            description: `Milestone payment received: "${milestone1.title}" (Gig: "${gig.title}")`,
            referenceId: gig._id
        });

        // Assertions
        const finalFreelancer = await User.findById(freelancer._id);
        const finalEscrow = await Escrow.findOne({ gig: gig._id });
        assert(finalFreelancer.walletBalance === 4000, 'Freelancer wallet balance credited with ₹4000', 'Freelancer credit failed');
        assert(finalEscrow.releasedAmount === 4000, 'Escrow released amount increased to ₹4000', 'Escrow release value incorrect');
        assert(finalEscrow.status === 'partially-released', 'Escrow status set to "partially-released"', 'Escrow status incorrect');

        // 9. Client marks gig as completed (Release remaining escrow balance)
        step('Client marks gig as completed. Auto-releasing remaining ₹6000...');
        
        // Simulating complete gig route logic
        gig.status = 'completed';
        gig.milestones.forEach(m => {
            if (m.status !== 'completed') {
                m.status = 'completed';
            }
        });
        await gig.save();

        const completeEscrow = await Escrow.findOne({ gig: gig._id });
        const remainingAmount = completeEscrow.amount - completeEscrow.releasedAmount;
        
        assert(remainingAmount === 6000, 'Remaining escrow balance correctly calculated as ₹6000', 'Remaining balance calculation incorrect');

        completeEscrow.releasedAmount = completeEscrow.amount;
        completeEscrow.status = 'released';
        await completeEscrow.save();

        const completedFreelancer = await User.findById(freelancer._id);
        completedFreelancer.walletBalance += remainingAmount;
        await completedFreelancer.save();

        await Transaction.create({
            user: freelancer._id,
            type: 'release',
            amount: remainingAmount,
            description: `Auto-released final escrow payment for completed Gig: "${gig.title}"`,
            referenceId: gig._id
        });

        // Final asserts
        const ultimateFreelancer = await User.findById(freelancer._id);
        const ultimateEscrow = await Escrow.findOne({ gig: gig._id });
        assert(ultimateFreelancer.walletBalance === 10000, 'Freelancer total wallet balance is ₹10000 (fully paid)', 'Freelancer final balance incorrect');
        assert(ultimateEscrow.releasedAmount === 10000, 'Escrow releasedAmount is ₹10000', 'Escrow final released amount incorrect');
        assert(ultimateEscrow.status === 'released', 'Escrow status is set to "released"', 'Escrow status incorrect');
        assert(gig.status === 'completed', 'Gig status is set to "completed"', 'Gig status incorrect');

        console.log('\n🌟 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🌟');

    } catch (err) {
        console.error('\n❌ TEST SUITE RUNTIME FAILURE:', err.message);
    } finally {
        // Clean up test records
        step('Cleaning up database test logs...');
        if (admin) await User.deleteOne({ _id: admin._id });
        if (client) await User.deleteOne({ _id: client._id });
        if (freelancer) await User.deleteOne({ _id: freelancer._id });
        if (gig) await Gig.deleteOne({ _id: gig._id });
        if (proposal) await Proposal.deleteOne({ _id: proposal._id });
        if (escrow) await Escrow.deleteOne({ _id: escrow._id });
        if (gig) {
            await Transaction.deleteMany({ referenceId: gig._id });
        }
        if (client) {
            await Transaction.deleteMany({ user: client._id });
        }
        
        // Close database connection
        mongoose.connection.close();
        console.log('Database connection closed. Test cleanup completed.');
    }
};

runTest();
