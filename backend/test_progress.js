const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');

// Import models
const User = require('./models/User');
const Gig = require('./models/Gig');
const Escrow = require('./models/Escrow');

const runTest = async () => {
    console.log('📈 STARTING PROJECT PROGRESS TRACKER TESTING...');
    
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

    let client, freelancer, gig, escrow;

    try {
        // Clean legacy test records
        await User.deleteMany({ email: /_test_prog@gigora\.dev$/ });

        // 1. Create client and freelancer accounts
        console.log('Creating test user accounts...');
        client = await User.create({
            username: 'client_test_prog',
            email: 'client_test_prog@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'client',
            isEmailVerified: true
        });

        freelancer = await User.create({
            username: 'freelancer_test_prog',
            email: 'freelancer_test_prog@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'freelancer',
            isEmailVerified: true
        });

        // 2. Create active gig with checklists inside milestones
        console.log('Creating active gig contract with checklists...');
        gig = await Gig.create({
            title: 'Test Progress Website Gig',
            description: 'A mock gig to test contract progress tracking',
            category: 'Web Development',
            budget: 5000,
            address: '123 Test Street',
            location: {
                type: 'Point',
                coordinates: [72.8777, 19.0760]
            },
            client: client._id,
            freelancer: freelancer._id,
            status: 'in-progress',
            milestones: [
                {
                    title: 'Milestone 1 (UI Design)',
                    budget: 2000,
                    status: 'pending',
                    checklist: [
                        { text: 'Design Figma layout', isCompleted: false },
                        { text: 'Review feedback', isCompleted: false }
                    ]
                },
                {
                    title: 'Milestone 2 (Backend Code)',
                    budget: 3000,
                    status: 'pending',
                    checklist: [
                        { text: 'Create DB Models', isCompleted: false },
                        { text: 'Implement API Routes', isCompleted: false }
                    ]
                }
            ]
        });

        const milestoneId = gig.milestones[0]._id;

        // 3. Freelancer updates checklist status (toggles first item)
        console.log('Freelancer marking first checklist sub-task as completed...');
        const milestone = gig.milestones.id(milestoneId);
        milestone.checklist[0].isCompleted = true;
        await gig.save();

        // Refetch gig from database
        const gigRefetched = await Gig.findById(gig._id);
        const refetchedMilestone = gigRefetched.milestones.id(milestoneId);
        
        assert(refetchedMilestone.checklist[0].isCompleted === true, 'Sub-task status updated in database successfully', 'Checklist update failed');

        // Check progress calculation: 1 task completed out of 4 total tasks = 25% progress
        let totalTasks = 0;
        let completedTasks = 0;
        gigRefetched.milestones.forEach(m => {
            if (m.checklist) {
                totalTasks += m.checklist.length;
                completedTasks += m.checklist.filter(c => c.isCompleted).length;
            }
        });
        const progress = Math.round((completedTasks / totalTasks) * 100);
        assert(progress === 25, 'Contract progress correctly calculated as 25%', `Progress calculation error: received ${progress}%`);

        // 4. Freelancer submits the first milestone with deliverable URLs
        console.log('Freelancer submitting milestone with deliverables...');
        const updatedMilestone = gigRefetched.milestones.id(milestoneId);
        updatedMilestone.status = 'submitted';
        updatedMilestone.deliverableUrl = 'https://figma.com/file-proof';
        updatedMilestone.deliverableNotes = 'Layout finished, awaiting approval.';
        await gigRefetched.save();

        // Refetch and verify details
        const finalRefetch = await Gig.findById(gig._id);
        const finalMilestone = finalRefetch.milestones.id(milestoneId);
        
        assert(finalMilestone.status === 'submitted', 'Milestone status is marked "submitted"', 'Milestone status failed to update');
        assert(finalMilestone.deliverableUrl === 'https://figma.com/file-proof', 'Deliverable link saved successfully', 'Deliverable link mismatch');
        assert(finalMilestone.deliverableNotes === 'Layout finished, awaiting approval.', 'Deliverable notes saved successfully', 'Deliverable notes mismatch');

        console.log('\n🌟 PROJECT PROGRESS TRACKER TESTS PASSED! 🌟');

    } catch (error) {
        console.error('\n❌ PROGRESS TEST SUITE RUNTIME FAILURE:', error.message);
    } finally {
        console.log('Cleaning up test records...');
        if (client) await User.deleteOne({ _id: client._id });
        if (freelancer) await User.deleteOne({ _id: freelancer._id });
        if (gig) await Gig.deleteOne({ _id: gig._id });

        mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

runTest();
