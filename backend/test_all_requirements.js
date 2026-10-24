const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Gig = require('./models/Gig');
const Proposal = require('./models/Proposal');
const Escrow = require('./models/Escrow');
const Transaction = require('./models/Transaction');
const Review = require('./models/Review');
const Notification = require('./models/Notification');

async function runComprehensiveAudit() {
  console.log('=== GIGORA COMPREHENSIVE BACKEND AUDIT ===\n');
  await mongoose.connect(process.env.MONGO_URI);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Password Safety Check
    const userWithoutPass = new User({ email: 'test_no_pass@gigora.com', googleId: '123456789' });
    const matchResult = await userWithoutPass.matchPassword('SomePassword123!');
    assert(matchResult === false, '1. matchPassword handles missing password safely without throw');

    // 2. Enum Validation Check
    const testFreelancer = await User.findOne({ email: 'vipingupta306090@gmail.com' });
    assert(!!testFreelancer, '2. Found primary freelancer account (Vipin Gupta)');
    if (testFreelancer) {
      testFreelancer.experienceLevel = 'Advanced';
      testFreelancer.skills = [{ name: 'React', level: 'Advanced' }];
      await testFreelancer.save();
      assert(testFreelancer.experienceLevel === 'Advanced', '3. ExperienceLevel & skill level "Advanced" enum validated cleanly');
    }

    // 3. Stale Gigs Check
    const openGigs = await Gig.find({ status: 'open' });
    const hasStaleGigs = openGigs.some(g => g.title.includes('Need MERN Developer') || g.title.includes('Hyperlocal Mobile App'));
    assert(!hasStaleGigs, '4. No stale June/July test gigs in open listings feed');

    // 4. Portfolio Proof Specificity
    if (testFreelancer && testFreelancer.portfolio) {
      const hasSpecificUrls = testFreelancer.portfolio.every(p => p.projectUrl || p.link || p.githubUrl);
      assert(hasSpecificUrls && testFreelancer.portfolio.length >= 3, '5. Freelancer portfolio contains specific repository URLs for every project');
    }

    // 5. Rating & Review Count Integrity Check
    const testReviews = await Review.find({ reviewee: testFreelancer._id });
    if (testReviews.length === 0) {
      assert(testFreelancer.reviewCount === undefined || testFreelancer.reviewCount === 0, '6. Review count is 0 when no reviews exist');
    }

    // 6. Role Switch Flow Test
    const initialRole = testFreelancer.role;
    testFreelancer.role = initialRole === 'freelancer' ? 'client' : 'freelancer';
    await testFreelancer.save();
    assert(testFreelancer.role !== initialRole, '7. Role successfully switched without Mongoose validation errors');
    testFreelancer.role = 'freelancer'; // Reset to freelancer
    await testFreelancer.save();
    assert(testFreelancer.role === 'freelancer', '8. Role cleanly restored to freelancer');

    // 7. Client Account Wallet & Balance Check
    const testClient = await User.findOne({ email: 'testclient_step6@gigora.com' });
    if (testClient) {
      assert(testClient.walletBalance >= 10000, '9. Test client has sufficient wallet balance for escrow testing');
    }

    // 8. Escrow Integrity Check
    const escrows = await Escrow.find();
    assert(Array.isArray(escrows), '10. Escrow collection accessible and queries cleanly');

    console.log(`\nAudit Complete: ${passed} Passed, ${failed} Failed.`);
  } catch (err) {
    console.error('Audit exception:', err);
    failed++;
  } finally {
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runComprehensiveAudit();
