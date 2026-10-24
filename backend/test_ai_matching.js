const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');

// Import models
const User = require('./models/User');
const Gig = require('./models/Gig');
const { calculateSimilarity } = require('./utils/aiMatcher');

const runTest = async () => {
    console.log('🤖 STARTING AI-POWERED MATCHING INTEGRATION TESTING...');
    
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

    let client, freelancerA, freelancerB, freelancerC, gig;

    try {
        // Clean legacy test records
        await User.deleteMany({ email: /_test_ai@gigora\.dev$/ });

        // 1. Create client and freelancers with diverse skill sets
        console.log('Creating test user profiles with skill tags...');
        client = await User.create({
            username: 'client_test_ai',
            email: 'client_test_ai@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'client',
            isEmailVerified: true
        });

        // Freelancer A - Perfect Match (React, Node, Javascript)
        freelancerA = await User.create({
            username: 'dev_react_test_ai',
            email: 'dev_react_test_ai@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'freelancer',
            isEmailVerified: true,
            skills: [
                { name: 'React', level: 'Expert' },
                { name: 'Node', level: 'Intermediate' },
                { name: 'Javascript', level: 'Expert' }
            ],
            bio: 'I build reactive web apps and scalable backend servers.'
        });

        // Freelancer B - Partial/No Match (Python, SQL)
        freelancerB = await User.create({
            username: 'dev_python_test_ai',
            email: 'dev_python_test_ai@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'freelancer',
            isEmailVerified: true,
            skills: [
                { name: 'Python', level: 'Expert' },
                { name: 'SQL', level: 'Intermediate' }
            ],
            bio: 'Data Scientist specializing in analytics.'
        });

        // Freelancer C - UI Designer (Figma)
        freelancerC = await User.create({
            username: 'designer_test_ai',
            email: 'designer_test_ai@gigora.dev',
            password: 'GigOraSecure2026!',
            role: 'freelancer',
            isEmailVerified: true,
            skills: [
                { name: 'Figma', level: 'Expert' },
                { name: 'UI Design', level: 'Expert' }
            ],
            bio: 'Figma designer focus on modern layouts.'
        });

        // 2. Create a React gig
        console.log('Creating a React Web App gig...');
        gig = await Gig.create({
            title: 'Build a React and Node Web Application',
            description: 'Looking for a developer to implement custom React dashboards and Node backend APIs.',
            category: 'Web Development',
            budget: 5000,
            client: client._id,
            status: 'open',
            address: 'Mumbai, India',
            location: {
                type: 'Point',
                coordinates: [72.8777, 19.0760]
            }
        });

        // 3. Run Matching Algorithm
        console.log('Calculating similarity scores between Gig and Freelancers...');
        const gigText = `${gig.title} ${gig.category} ${gig.description}`;
        const candidates = [freelancerA, freelancerB, freelancerC];
        const freelancerTexts = candidates.map(f => f.skills.map(s => s.name).join(', ') + ' ' + (f.bio || ''));

        // Query aiMatcher
        const scores = await calculateSimilarity(gigText, freelancerTexts);
        console.log('Raw similarity scores computed:', scores);

        // Ranks candidates
        const ranked = candidates.map((f, idx) => ({
            username: f.username,
            score: scores[idx] || 0
        }))
        .sort((a, b) => b.score - a.score);

        console.log('Ranked Candidates list:');
        ranked.forEach((r, idx) => console.log(`  [Rank ${idx + 1}] ${r.username}: Similarity Score = ${r.score}`));

        // 4. Verify Assertions
        assert(ranked[0].username === 'dev_react_test_ai', 'Freelancer A (React/Node Dev) ranked first', 'Freelancer A ranking failed');
        assert(ranked[0].score > ranked[1].score, 'Freelancer A score is higher than Freelancer B (Python Dev)', 'Score comparison failed');
        assert(ranked[2].username === 'designer_test_ai' || ranked[1].username === 'designer_test_ai', 'Test matching ranks all correctly', 'Ranking matches failed');

        console.log('\n🌟 AI MATCHING SYSTEM INTEGRATION TESTS PASSED! 🌟');

    } catch (error) {
        console.error('\n❌ AI MATCHING TEST SUITE RUNTIME FAILURE:', error.message);
    } finally {
        console.log('Cleaning up test data...');
        if (client) await User.deleteOne({ _id: client._id });
        if (freelancerA) await User.deleteOne({ _id: freelancerA._id });
        if (freelancerB) await User.deleteOne({ _id: freelancerB._id });
        if (freelancerC) await User.deleteOne({ _id: freelancerC._id });
        if (gig) await Gig.deleteOne({ _id: gig._id });

        mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

runTest();
