const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Gig = require('./models/Gig');
const Proposal = require('./models/Proposal');

const MONGO_URI = process.env.MONGO_URI;
const API_BASE = 'http://localhost:5000/api';

async function runPhase4Verification() {
  console.log('====================================================');
  console.log('🚀 GIGORA PHASE 4 VERIFICATION SUITE');
  console.log('====================================================');

  if (!MONGO_URI) {
    console.error('❌ MONGO_URI missing in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('✓ Connected to MongoDB Atlas');

  let passedTests = 0;
  const totalTests = 7;

  try {
    // 1. Setup Test Client & Freelancer Accounts
    const clientTimestamp = Date.now();
    const clientEmail = `phase4_client_${clientTimestamp}@gigora.test`;
    const freeEmail = `phase4_free_${clientTimestamp}@gigora.test`;

    const clientRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Phase4 Client Tech Corp',
        username: `clientp4_${clientTimestamp}`,
        email: clientEmail,
        password: 'Password123!',
        role: 'client'
      })
    });
    const clientData = await clientRes.json();
    const clientCookie = clientRes.headers.get('set-cookie');
    const clientId = clientData.user._id;

    // Verify email for client and freelancer
    await User.findByIdAndUpdate(clientId, { isEmailVerified: true });

    const freeRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Phase4 Freelancer Dev',
        username: `freep4_${clientTimestamp}`,
        email: freeEmail,
        password: 'Password123!',
        role: 'freelancer'
      })
    });
    const freeData = await freeRes.json();
    const freeCookie = freeRes.headers.get('set-cookie');
    const freeId = freeData.user._id;

    await User.findByIdAndUpdate(freeId, { 
      isEmailVerified: true,
      bio: 'Professional Full-Stack Developer with over 4 years of experience building modern web apps.',
      skills: [{ name: 'Ruby', level: 'Intermediate' }],
      preferredCategories: ['Mobile Apps']
    });

    console.log('✓ Test Client and Freelancer accounts established with verified emails');

    // 2. Client posts a published open project
    const uniqueTitle = `Phase 4 Real Next.js Portal ${clientTimestamp}`;
    const pubGigRes = await fetch(`${API_BASE}/gigs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': clientCookie
      },
      body: JSON.stringify({
        title: uniqueTitle,
        description: 'Building an enterprise customer portal with Next.js, React, and MongoDB.',
        category: 'Web Development',
        budget: 25000,
        skillsRequired: ['Next.js', 'React', 'MongoDB'],
        status: 'open',
        locationType: 'remote'
      })
    });
    const pubGigData = await pubGigRes.json();
    const openGigId = pubGigData.data._id;
    console.log('✓ Client published open project:', uniqueTitle);

    // TEST 1: Freelancer account se published project ko dhoondo
    console.log('\n--- TEST 1: Freelancer discovers Client Published Project ---');
    const searchRes = await fetch(`${API_BASE}/gigs?search=${encodeURIComponent(uniqueTitle)}`);
    const searchData = await searchRes.json();
    if (searchData.success && searchData.data.some(g => g._id === openGigId && g.status === 'open')) {
      console.log('✅ TEST 1 PASSED: Client published project found on freelancer browse endpoint');
      passedTests++;
    } else {
      console.error('❌ TEST 1 FAILED: Published project not found');
    }

    // TEST 2: Multi-filter test (Title/Description, Skill, Category, Budget individually and combined)
    console.log('\n--- TEST 2: Multi-Filter Search Tests ---');
    const titleFilterRes = await (await fetch(`${API_BASE}/gigs?search=portal`)).json();
    const skillFilterRes = await (await fetch(`${API_BASE}/gigs?skills=React`)).json();
    const catFilterRes = await (await fetch(`${API_BASE}/gigs?category=Web%20Development`)).json();
    const budgetFilterRes = await (await fetch(`${API_BASE}/gigs?minBudget=20000&maxBudget=30000`)).json();
    const combinedFilterRes = await (await fetch(`${API_BASE}/gigs?search=portal&skills=React&category=Web%20Development&minBudget=20000&maxBudget=30000`)).json();
    const mismatchFilterRes = await (await fetch(`${API_BASE}/gigs?search=portal&category=Design`)).json();

    const titleOk = titleFilterRes.data.some(g => g._id === openGigId);
    const skillOk = skillFilterRes.data.some(g => g._id === openGigId);
    const catOk = catFilterRes.data.some(g => g._id === openGigId);
    const budgetOk = budgetFilterRes.data.some(g => g._id === openGigId);
    const combinedOk = combinedFilterRes.data.some(g => g._id === openGigId);
    const mismatchOk = !mismatchFilterRes.data.some(g => g._id === openGigId);

    if (titleOk && skillOk && catOk && budgetOk && combinedOk && mismatchOk) {
      console.log('✅ TEST 2 PASSED: Title, skill, category, budget filters work independently & combined correctly');
      passedTests++;
    } else {
      console.error('❌ TEST 2 FAILED: Filter mismatch:', { titleOk, skillOk, catOk, budgetOk, combinedOk, mismatchOk });
    }

    // TEST 3: Demo Listings vs Real Projects separation
    console.log('\n--- TEST 3: Demo vs Real Projects Separation ---');
    // Create a demo gig
    const demoGig = await Gig.create({
      title: `Sample / Demo Showcase Project ${clientTimestamp}`,
      description: 'This is a sample gig created for preview demonstration only.',
      category: 'Design',
      budget: 8000,
      client: clientId,
      status: 'open',
      isDemo: true,
      skillsRequired: ['Figma', 'UI/UX']
    });

    const realListRes = await (await fetch(`${API_BASE}/gigs?isReal=true`)).json();
    const demoListRes = await (await fetch(`${API_BASE}/gigs?isDemo=true`)).json();

    const realExcludesDemo = !realListRes.data.some(g => g._id === String(demoGig._id));
    const demoContainsDemo = demoListRes.data.some(g => g._id === String(demoGig._id));
    const demoExcludesReal = !demoListRes.data.some(g => g._id === openGigId);

    if (realExcludesDemo && demoContainsDemo && demoExcludesReal) {
      console.log('✅ TEST 3 PASSED: Demo listings cleanly segregated from real client projects');
      passedTests++;
    } else {
      console.error('❌ TEST 3 FAILED: Demo separation failed:', { realExcludesDemo, demoContainsDemo, demoExcludesReal });
    }

    // TEST 4: Draft, Closed & Demo Proposal Denial
    console.log('\n--- TEST 4: Proposal Gating for Closed, Draft & Demo Projects ---');
    // A. Draft project
    const draftGig = await Gig.create({
      title: `Draft Project Not Ready ${clientTimestamp}`,
      description: 'Draft outline not ready for bidding.',
      category: 'Writing',
      budget: 5000,
      client: clientId,
      status: 'draft',
      skillsRequired: ['Writing']
    });

    // B. Closed project
    const closedGig = await Gig.create({
      title: `Closed Archived Project ${clientTimestamp}`,
      description: 'Project already completed and closed.',
      category: 'Web Development',
      budget: 15000,
      client: clientId,
      status: 'closed',
      skillsRequired: ['HTML']
    });

    // Attempt proposal on Draft
    const draftPropRes = await fetch(`${API_BASE}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': freeCookie },
      body: JSON.stringify({
        gigId: draftGig._id,
        bidAmount: 5000,
        estimatedTime: '3 days',
        coverLetter: 'I would like to apply to this draft project.'
      })
    });
    const draftPropData = await draftPropRes.json();
    const draftBlocked = draftPropRes.status === 400 && draftPropData.success === false;

    // Attempt proposal on Closed
    const closedPropRes = await fetch(`${API_BASE}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': freeCookie },
      body: JSON.stringify({
        gigId: closedGig._id,
        bidAmount: 15000,
        estimatedTime: '5 days',
        coverLetter: 'I would like to apply to this closed project.'
      })
    });
    const closedPropData = await closedPropRes.json();
    const closedBlocked = closedPropRes.status === 400 && closedPropData.success === false;

    // Attempt proposal on Demo
    const demoPropRes = await fetch(`${API_BASE}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': freeCookie },
      body: JSON.stringify({
        gigId: demoGig._id,
        bidAmount: 8000,
        estimatedTime: '2 days',
        coverLetter: 'I would like to apply to this demo project.'
      })
    });
    const demoPropData = await demoPropRes.json();
    const demoBlocked = demoPropRes.status === 400 && demoPropData.success === false;

    if (draftBlocked && closedBlocked && demoBlocked) {
      console.log('✅ TEST 4 PASSED: Draft, Closed, and Demo projects strictly reject proposal submissions');
      passedTests++;
    } else {
      console.error('❌ TEST 4 FAILED: Proposal gating bypassed:', { draftBlocked, closedBlocked, demoBlocked });
    }

    // TEST 5: Profile skills update triggers dynamic matching results
    console.log('\n--- TEST 5: Dynamic Skill Update & Matching Results ---');
    // Initially freelancer has only 'Ruby'. Check matched skills for open gig:
    const initialMatchRes = await (await fetch(`${API_BASE}/freelancer/matched-gigs`, {
      headers: { 'Cookie': freeCookie }
    })).json();
    const initialProject = (initialMatchRes.allGigs || []).find(g => g._id === openGigId);
    const initialHasSkillMatch = Boolean(
      initialProject && 
      initialProject.matchedSkills && 
      initialProject.matchedSkills.some(s => s.toLowerCase() === 'react')
    );

    // Now update freelancer skills to include 'React' and 'Next.js'
    const updateProfileRes = await fetch(`${API_BASE}/freelancer/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Cookie': freeCookie },
      body: JSON.stringify({
        skills: [
          { name: 'React', level: 'Expert' },
          { name: 'Next.js', level: 'Intermediate' }
        ]
      })
    });
    const updateProfileData = await updateProfileRes.json();

    // Re-check matched gigs
    const updatedMatchRes = await (await fetch(`${API_BASE}/freelancer/matched-gigs`, {
      headers: { 'Cookie': freeCookie }
    })).json();

    const matchedProject = (updatedMatchRes.allGigs || []).find(g => g._id === openGigId);
    const updatedHasSkillMatch = Boolean(
      matchedProject && 
      matchedProject.matchedSkills && 
      matchedProject.matchedSkills.some(s => s.toLowerCase() === 'react') &&
      matchedProject.matchScore > (initialProject ? initialProject.matchScore : 0)
    );

    if (!initialHasSkillMatch && updatedHasSkillMatch) {
      console.log(`✅ TEST 5 PASSED: Updating skills dynamically matched open client project (Score: ${initialProject?.matchScore} -> ${matchedProject.matchScore}, Matched: ${matchedProject.matchedSkills.join(', ')})`);
      passedTests++;
    } else {
      console.error('❌ TEST 5 FAILED: Dynamic matching did not update properly:', { initialHasSkillMatch, updatedHasSkillMatch });
    }

    // TEST 6: Pagination behavior check
    console.log('\n--- TEST 6: Pagination and Metadata Check ---');
    const page1Res = await (await fetch(`${API_BASE}/gigs?page=1&limit=2`)).json();
    const page2Res = await (await fetch(`${API_BASE}/gigs?page=2&limit=2`)).json();

    const p1Count = page1Res.data.length;
    const p2Count = page2Res.data.length;
    const totalCount = page1Res.totalCount;
    const totalPages = page1Res.totalPages;

    // Check that page 1 and page 2 items are distinct
    const p1Ids = new Set(page1Res.data.map(g => g._id));
    const isDistinct = !page2Res.data.some(g => p1Ids.has(g._id));

    if (p1Count > 0 && totalPages >= 1 && totalCount >= p1Count && isDistinct) {
      console.log(`✅ TEST 6 PASSED: Pagination works (Page 1: ${p1Count} items, Page 2: ${p2Count} items, Total: ${totalCount}, Total Pages: ${totalPages}, Pages Distinct: ${isDistinct})`);
      passedTests++;
    } else {
      console.error('❌ TEST 6 FAILED: Pagination anomaly:', { p1Count, p2Count, totalCount, totalPages, isDistinct });
    }

    // TEST 7: Successful Proposal submission on Open Project
    console.log('\n--- TEST 7: Valid Proposal on Real Open Project ---');
    const validPropRes = await fetch(`${API_BASE}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': freeCookie },
      body: JSON.stringify({
        gigId: openGigId,
        bidAmount: 24000,
        estimatedTime: '2 weeks',
        coverLetter: 'I have extensive experience with Next.js and React enterprise portals. Let me deliver your MVP!'
      })
    });
    const validPropData = await validPropRes.json();
    if (validPropRes.ok && validPropData.success) {
      console.log('✅ TEST 7 PASSED: Proposal successfully submitted on real open client project');
      passedTests++;
    } else {
      console.error('❌ TEST 7 FAILED:', validPropData.message);
    }

    // Cleanup test data
    await Proposal.deleteMany({ gig: { $in: [openGigId, draftGig._id, closedGig._id, demoGig._id] } });
    await Gig.deleteMany({ _id: { $in: [openGigId, draftGig._id, closedGig._id, demoGig._id] } });
    await User.deleteMany({ _id: { $in: [clientId, freeId] } });
    console.log('✓ Cleaned up Phase 4 test database entries');

  } catch (err) {
    console.error('❌ Unexpected error in Phase 4 verification:', err);
  } finally {
    await mongoose.disconnect();
  }

  console.log('\n====================================================');
  console.log(`RESULT: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('====================================================');

  if (passedTests === totalTests) {
    console.log('🎉 PHASE 4 FULLY VERIFIED & READY FOR SIGN-OFF!');
    process.exit(0);
  } else {
    console.log('❌ PHASE 4 VERIFICATION FAILED');
    process.exit(1);
  }
}

runPhase4Verification();
