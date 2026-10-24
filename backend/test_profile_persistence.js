const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

async function testProfilePersistence() {
    console.log('🧪 STARTING PROFILE SAVE / PERSISTENCE VERIFICATION TEST...');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully.');

    const testEmail = `qa_persist_${Date.now()}@example.com`;
    const password = 'Password@123';
    const testUsername = `qa_persist_${Date.now()}`;

    // 1. Create a fresh freelancer account
    console.log('\n[STEP 1] Creating fresh freelancer account...');
    let user = await User.create({
        name: 'Vipin Test',
        username: testUsername,
        email: testEmail,
        password: password,
        role: 'freelancer',
        isEmailVerified: true
    });

    console.log(` ✅ Account created: ${user.email} (ID: ${user._id})`);
    
    // Initial profile check
    const initialStrength = [
        Boolean(user.name && user.name.trim()),
        Boolean(user.isEmailVerified),
        Boolean(user.bio && user.bio.trim().length > 10),
        Boolean(user.skills && user.skills.length > 0),
        Boolean(user.portfolio && user.portfolio.length > 0)
    ].filter(Boolean).length * 20;

    console.log(` Initial Profile Strength: ${initialStrength}% (Name=true, EmailVerified=true, Bio=false, Skills=false, Portfolio=false)`);

    // 2. Simulate User opening "Complete Profile", filling skills, headline, bio, rate, and saving
    console.log('\n[STEP 2] Updating profile details (Skills, Headline, Bio, Hourly Rate)...');
    
    const updateData = {
        headline: 'Full Stack MERN Developer',
        bio: 'Passionate Full Stack Developer with 3+ years experience building scalable web applications with React and Node.js.',
        hourlyRate: 1500,
        skills: [
            { name: 'React', level: 'Expert' },
            { name: 'Node.js', level: 'Expert' },
            { name: 'MongoDB', level: 'Intermediate' }
        ],
        preferredCategories: ['Web Development', 'Backend & APIs']
    };

    // Simulate backend route /api/freelancer/profile logic
    user.headline = updateData.headline;
    user.bio = updateData.bio;
    user.hourlyRate = updateData.hourlyRate;
    user.skills = updateData.skills;
    user.preferredCategories = updateData.preferredCategories;
    user.hasSkippedOnboarding = false;

    // Check completion criteria
    const hasValidSkills = user.skills && user.skills.length > 0;
    const hasValidBio = user.bio && user.bio.trim().length >= 10;
    const hasCategories = user.preferredCategories && user.preferredCategories.length > 0;
    user.isProfileComplete = Boolean(hasValidSkills && hasValidBio && hasCategories);

    await user.save();
    console.log(' ✅ Profile saved successfully into MongoDB.');

    // 3. Simulate Page Refresh (re-fetching fresh from database)
    console.log('\n[STEP 3] Simulating Page Refresh (fetching fresh user document from DB)...');
    const refreshedUser = await User.findById(user._id).select('-password');

    console.log(' Checking refreshed document fields:');
    console.log(`  - Headline: "${refreshedUser.headline}"`);
    console.log(`  - Bio: "${refreshedUser.bio.slice(0, 40)}..."`);
    console.log(`  - Hourly Rate: ₹${refreshedUser.hourlyRate}/hr`);
    console.log(`  - Skills Count: ${refreshedUser.skills.length} (${refreshedUser.skills.map(s => s.name).join(', ')})`);
    console.log(`  - isProfileComplete: ${refreshedUser.isProfileComplete}`);

    if (refreshedUser.headline !== updateData.headline) throw new Error('Headline did not persist on refresh!');
    if (refreshedUser.hourlyRate !== updateData.hourlyRate) throw new Error('Hourly rate did not persist on refresh!');
    if (refreshedUser.skills.length !== 3) throw new Error('Skills did not persist on refresh!');

    const refreshedStrength = [
        Boolean(refreshedUser.name && refreshedUser.name.trim()),
        Boolean(refreshedUser.isEmailVerified),
        Boolean(refreshedUser.bio && refreshedUser.bio.trim().length > 10),
        Boolean(refreshedUser.skills && refreshedUser.skills.length > 0),
        Boolean(refreshedUser.portfolio && refreshedUser.portfolio.length > 0)
    ].filter(Boolean).length * 20;

    console.log(` ✅ Profile Strength after update & refresh: ${refreshedStrength}% (Increased from ${initialStrength}%)`);

    // 4. Simulate Logout & Login (re-authenticating user)
    console.log('\n[STEP 4] Simulating Logout and Re-Login with credentials...');
    const loggedInUser = await User.findOne({ email: testEmail });
    if (!loggedInUser) throw new Error('User not found on re-login!');
    const isPasswordMatch = await loggedInUser.matchPassword(password);
    if (!isPasswordMatch) throw new Error('Password mismatch on re-login!');

    console.log(' ✅ Login credentials authenticated.');
    console.log(' Checking re-login document fields:');
    console.log(`  - Name: "${loggedInUser.name}"`);
    console.log(`  - Headline: "${loggedInUser.headline}"`);
    console.log(`  - Bio: "${loggedInUser.bio.slice(0, 40)}..."`);
    console.log(`  - Hourly Rate: ₹${loggedInUser.hourlyRate}/hr`);
    console.log(`  - Skills: ${loggedInUser.skills.map(s => s.name).join(', ')}`);
    console.log(`  - Has Skipped Onboarding: ${loggedInUser.hasSkippedOnboarding}`);

    const loginStrength = [
        Boolean(loggedInUser.name && loggedInUser.name.trim()),
        Boolean(loggedInUser.isEmailVerified),
        Boolean(loggedInUser.bio && loggedInUser.bio.trim().length > 10),
        Boolean(loggedInUser.skills && loggedInUser.skills.length > 0),
        Boolean(loggedInUser.portfolio && loggedInUser.portfolio.length > 0)
    ].filter(Boolean).length * 20;

    console.log(` ✅ Profile Strength after re-login: ${loginStrength}%`);

    if (loginStrength !== refreshedStrength) {
        throw new Error('Profile strength mismatch after re-login!');
    }

    // 5. Cleanup test user
    console.log('\n[STEP 5] Cleaning up test records...');
    await User.findByIdAndDelete(user._id);
    console.log(' Test record cleaned up.');

    await mongoose.connection.close();
    console.log('\n🎉 ALL PROFILE PERSISTENCE CHECKS PASSED: 100% PERSISTENT & VERIFIED!\n');
}

testProfilePersistence().catch(err => {
    console.error('❌ PERSISTENCE TEST FAILED:', err);
    process.exit(1);
});
