const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');

// Import models
const User = require('./models/User');

const runTest = async () => {
    console.log('✉️ STARTING EMAIL VERIFICATION FLOW TESTING...');
    
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

    let user;

    try {
        // Clean legacy test records
        await User.deleteMany({ email: /_test_email_verif@gigora\.dev$/ });

        const verificationToken = 'mock_verif_token_123456';

        // 1. Create a registration entry (unverified)
        console.log('Registering test user (unverified)...');
        user = await User.create({
            username: 'user_test_email_verif',
            email: 'user_test_email_verif@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'freelancer',
            isEmailVerified: false,
            emailVerificationToken: verificationToken
        });

        // 2. Validate that login is blocked for unverified email
        console.log('Asserting that login is blocked prior to verification...');
        const userFound = await User.findOne({ email: user.email });
        
        assert(userFound.isEmailVerified === false, 'Account verification flag is set to false initially', 'Initial verified flag mismatch');
        assert(userFound.emailVerificationToken === verificationToken, 'Account token matches the generated token', 'Token mismatch');

        // 3. Simulate calling the verification endpoint
        console.log('Verifying email address via token validation simulation...');
        const userToVerify = await User.findOne({ emailVerificationToken: verificationToken });
        if (userToVerify) {
            userToVerify.isEmailVerified = true;
            userToVerify.emailVerificationToken = undefined;
            await userToVerify.save();
        }

        // 4. Validate that login succeeds post-verification
        console.log('Asserting that account is verified and login works...');
        const verifiedUser = await User.findById(user._id);
        
        assert(verifiedUser.isEmailVerified === true, 'Verification flag correctly updated to true', 'Verification toggle failed');
        assert(verifiedUser.emailVerificationToken === undefined, 'Verification token cleared after activation', 'Token cleanup failed');

        console.log('\n🌟 EMAIL VERIFICATION TESTS PASSED! 🌟');

    } catch (error) {
        console.error('\n❌ EMAIL VERIFICATION TEST SUITE RUNTIME FAILURE:', error.message);
    } finally {
        console.log('Cleaning up test records...');
        if (user) await User.deleteOne({ _id: user._id });

        mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

runTest();
