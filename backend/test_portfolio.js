const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');

// Import models
const User = require('./models/User');

const runTest = async () => {
    console.log('📂 STARTING FREELANCER PORTFOLIO CRUD MECHANISM TESTING...');
    
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

    let freelancer;

    try {
        // Clean legacy test records
        await User.deleteMany({ email: /_test_port@gigora\.dev$/ });

        // 1. Create freelancer account
        console.log('Creating test freelancer user account...');
        freelancer = await User.create({
            username: 'freelancer_test_port',
            email: 'freelancer_test_port@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'freelancer',
            isEmailVerified: true,
            portfolio: []
        });

        // 2. Add portfolio item
        console.log('Adding portfolio project item to database...');
        freelancer.portfolio.push({
            title: 'GigOra Real-time Chat Node.js Project',
            description: 'Implemented web sockets communication with multiple client rooms.',
            projectUrl: 'https://github.com/test/chat-room',
            imageUrl: 'https://mockimage.com/thumbnail.png'
        });
        await freelancer.save();

        // 3. Refetch and verify saving details
        const savedUser = await User.findById(freelancer._id);
        assert(savedUser.portfolio.length === 1, 'Portfolio item saved successfully', 'Failed to save project');
        assert(savedUser.portfolio[0].title === 'GigOra Real-time Chat Node.js Project', 'Project title matches', 'Title mismatch');
        assert(savedUser.portfolio[0].projectUrl === 'https://github.com/test/chat-room', 'Project link matches', 'URL mismatch');

        const itemId = savedUser.portfolio[0]._id;

        // 4. Delete portfolio item
        console.log('Deleting portfolio project item from database...');
        savedUser.portfolio = savedUser.portfolio.filter(item => item._id.toString() !== itemId.toString());
        await savedUser.save();

        // 5. Refetch and verify removal
        const finalUser = await User.findById(freelancer._id);
        assert(finalUser.portfolio.length === 0, 'Portfolio item deleted successfully', 'Failed to delete project');

        console.log('\n🌟 PORTFOLIO CRUD INTEGRATION TESTS PASSED! 🌟');

    } catch (error) {
        console.error('\n❌ PORTFOLIO TEST SUITE RUNTIME FAILURE:', error.message);
    } finally {
        console.log('Cleaning up test records...');
        if (freelancer) await User.deleteOne({ _id: freelancer._id });

        mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

runTest();
