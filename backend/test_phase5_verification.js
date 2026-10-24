/**
 * Phase 5 Automated Verification Suite: Proposal Submission, Duplicate Prevention,
 * Multi-Tenant Client Review, Cross-Dashboard Synchronization, and Contract Protection.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Gig = require('./models/Gig');
const Proposal = require('./models/Proposal');
const Escrow = require('./models/Escrow');
const Transaction = require('./models/Transaction');

const MONGO_URI = process.env.MONGO_URI;
const API_BASE = 'http://localhost:5000/api';

async function runPhase5Verification() {
  console.log('====================================================');
  console.log('🚀 GIGORA PHASE 5 VERIFICATION SUITE');
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
    const timestamp = Date.now();
    const clientAEmail = `phase5_clientA_${timestamp}@gigora.test`;
    const clientBEmail = `phase5_clientB_${timestamp}@gigora.test`;
    const free1Email = `phase5_free1_${timestamp}@gigora.test`;
    const free2Email = `phase5_free2_${timestamp}@gigora.test`;

    // 1. Setup Client A (Owner)
    const clientARes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alpha Ventures India',
        username: `clientA_${timestamp}`,
        email: clientAEmail,
        password: 'Password123!',
        role: 'client'
      })
    });
    const clientAData = await clientARes.json();
    const clientACookie = clientARes.headers.get('set-cookie');
    const clientAId = clientAData.user._id;

    // Give Client A verified email and sufficient sandbox test wallet balance
    await User.findByIdAndUpdate(clientAId, { 
      isEmailVerified: true, 
      walletBalance: 50000 
    });

    // 2. Setup Client B (Unauthorized second client)
    const clientBRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Beta Global Tech',
        username: `clientB_${timestamp}`,
        email: clientBEmail,
        password: 'Password123!',
        role: 'client'
      })
    });
    const clientBData = await clientBRes.json();
    const clientBCookie = clientBRes.headers.get('set-cookie');
    const clientBId = clientBData.user._id;
    await User.findByIdAndUpdate(clientBId, { isEmailVerified: true, walletBalance: 50000 });

    // 3. Setup Freelancer 1
    const free1Res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sameer Kulkarni',
        username: `sameer_${timestamp}`,
        email: free1Email,
        password: 'Password123!',
        role: 'freelancer'
      })
    });
    const free1Data = await free1Res.json();
    const free1Cookie = free1Res.headers.get('set-cookie');
    const free1Id = free1Data.user._id;

    await User.findByIdAndUpdate(free1Id, {
      isEmailVerified: true,
      headline: 'Senior Full Stack MERN Architect',
      bio: 'Over 5 years building scalable e-commerce and fintech web applications across India.',
      skills: [{ name: 'React', level: 'Expert' }, { name: 'Node.js', level: 'Expert' }],
      preferredCategories: ['Web Development'],
      hourlyRate: 1200,
      experienceLevel: 'Expert',
      workPreference: 'remote'
    });

    // 4. Setup Freelancer 2
    const free2Res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ananya Sharma',
        username: `ananya_${timestamp}`,
        email: free2Email,
        password: 'Password123!',
        role: 'freelancer'
      })
    });
    const free2Data = await free2Res.json();
    const free2Cookie = free2Res.headers.get('set-cookie');
    const free2Id = free2Data.user._id;

    await User.findByIdAndUpdate(free2Id, {
      isEmailVerified: true,
      headline: 'Frontend React UI Developer',
      bio: 'Passionate frontend developer crafting performant responsive interfaces with Tailwind CSS.',
      skills: [{ name: 'React', level: 'Intermediate' }],
      preferredCategories: ['Web Development'],
      hourlyRate: 800
    });

    console.log('✓ Test accounts established with verified credentials & test balances');

    // Client A posts and publishes an open project
    const pubGigRes = await fetch(`${API_BASE}/gigs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': clientACookie },
      body: JSON.stringify({
        title: `E-Commerce Supply Chain Tracking System ${timestamp}`,
        description: 'Complete cloud order dispatcher with automated status workflows and real-time updates.',
        category: 'Web Development',
        budget: 20000,
        skillsRequired: ['React', 'Node.js', 'MongoDB'],
        status: 'open',
        locationType: 'remote'
      })
    });
    const pubGigData = await pubGigRes.json();
    const gigId = pubGigData.data._id;
    console.log('✓ Client A published open project ID:', gigId);

    // =========================================================================
    // TEST 1: Freelancer 1 submits proposal on open project
    // =========================================================================
    console.log('\n--- TEST 1: Proposal Submission on Open Client Project ---');
    const prop1Res = await fetch(`${API_BASE}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': free1Cookie },
      body: JSON.stringify({
        gigId,
        bidAmount: 19500,
        estimatedTime: '2 weeks',
        coverLetter: 'I have designed identical supply chain tracking tools for Mumbai logistics clients. Ready to start immediately!'
      })
    });
    const prop1Data = await prop1Res.json();
    const prop1Id = prop1Data.data?._id;

    if (prop1Res.status === 201 && prop1Data.success && prop1Data.data.status === 'pending') {
      console.log('✅ TEST 1 PASSED: Freelancer 1 proposal submitted successfully (Pending review, bid ₹19,500)');
      passedTests++;
    } else {
      console.error('❌ TEST 1 FAILED:', prop1Data.message);
    }

    // =========================================================================
    // TEST 2: Duplicate Proposal Submission Prevention
    // =========================================================================
    console.log('\n--- TEST 2: Duplicate Active Proposal Rejection ---');
    const dupPropRes = await fetch(`${API_BASE}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': free1Cookie },
      body: JSON.stringify({
        gigId,
        bidAmount: 18000,
        estimatedTime: '10 days',
        coverLetter: 'Attempting duplicate bid on the same gig.'
      })
    });
    const dupPropData = await dupPropRes.json();

    const countOnGig = await Proposal.countDocuments({ gig: gigId, freelancer: free1Id });
    if (dupPropRes.status === 400 && dupPropData.success === false && countOnGig === 1) {
      console.log(`✅ TEST 2 PASSED: Duplicate proposal prevented with 400 rejection ("${dupPropData.message}"), DB count remains 1`);
      passedTests++;
    } else {
      console.error('❌ TEST 2 FAILED: Duplicate proposal was not properly blocked:', dupPropData);
    }

    // =========================================================================
    // TEST 3: Client A reviews proposal and freelancer profile details
    // =========================================================================
    console.log('\n--- TEST 3: Client A Proposal & Freelancer Inspection ---');
    const clientReviewRes = await fetch(`${API_BASE}/proposals/client/all-proposals`, {
      headers: { 'Cookie': clientACookie }
    });
    const clientReviewData = await clientReviewRes.json();
    const reviewedProp = (clientReviewData.data || []).find(p => p._id === prop1Id);

    const hasFreelancerInfo = Boolean(
      reviewedProp &&
      reviewedProp.freelancer &&
      reviewedProp.freelancer.name === 'Sameer Kulkarni' &&
      reviewedProp.freelancer.headline &&
      reviewedProp.freelancer.bio &&
      reviewedProp.freelancer.skills.length > 0 &&
      reviewedProp.bidAmount === 19500 &&
      reviewedProp.coverLetter
    );

    if (clientReviewRes.ok && hasFreelancerInfo) {
      console.log(`✅ TEST 3 PASSED: Client A retrieved proposal with rich freelancer details (Name: ${reviewedProp.freelancer.name}, Skills: ${reviewedProp.freelancer.skills.map(s => s.name || s).join(', ')}, Quote: ₹${reviewedProp.bidAmount})`);
      passedTests++;
    } else {
      console.error('❌ TEST 3 FAILED: Client could not inspect proposal details cleanly');
    }

    // =========================================================================
    // TEST 4: Security & Isolation: Unauthorized Client B Access Denial
    // =========================================================================
    console.log('\n--- TEST 4: Unauthorized Client Access Denial (403 Forbidden) ---');
    // A. Client B tries to view Client A's gig proposals
    const bGigPropsRes = await fetch(`${API_BASE}/proposals/gig/${gigId}`, {
      headers: { 'Cookie': clientBCookie }
    });
    const bGigPropsBlocked = bGigPropsRes.status === 403;

    // B. Client B tries to query specific proposal
    const bSinglePropRes = await fetch(`${API_BASE}/proposals/${prop1Id}`, {
      headers: { 'Cookie': clientBCookie }
    });
    const bSinglePropBlocked = bSinglePropRes.status === 403;

    // C. Client B tries to accept Client A's proposal
    const bAcceptPropRes = await fetch(`${API_BASE}/proposals/${prop1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Cookie': clientBCookie },
      body: JSON.stringify({ status: 'accepted' })
    });
    const bAcceptBlocked = bAcceptPropRes.status === 403;

    // D. Client B checks own proposals list (Client A's proposal must NOT leak)
    const bAllPropsRes = await (await fetch(`${API_BASE}/proposals/client/all-proposals`, {
      headers: { 'Cookie': clientBCookie }
    })).json();
    const noLeakage = !bAllPropsRes.data.some(p => p._id === prop1Id);

    if (bGigPropsBlocked && bSinglePropBlocked && bAcceptBlocked && noLeakage) {
      console.log('✅ TEST 4 PASSED: Multi-tenant ownership strictly enforced (Client B blocked from view/manage with 403 Forbidden)');
      passedTests++;
    } else {
      console.error('❌ TEST 4 FAILED: Security boundary bypassed:', { bGigPropsBlocked, bSinglePropBlocked, bAcceptBlocked, noLeakage });
    }

    // =========================================================================
    // TEST 5: Client Rejects a Candidate Proposal & Syncs Across Both Dashboards
    // =========================================================================
    console.log('\n--- TEST 5: Proposal Rejection & Dual-Dashboard Synchronization ---');
    // Freelancer 2 submits proposal
    const prop2Res = await fetch(`${API_BASE}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': free2Cookie },
      body: JSON.stringify({
        gigId,
        bidAmount: 18000,
        estimatedTime: '3 weeks',
        coverLetter: 'Hello, I would like to submit my candidacy for your supply chain system.'
      })
    });
    const prop2Data = await prop2Res.json();
    const prop2Id = prop2Data.data._id;

    // Client A rejects Freelancer 2's proposal
    const rejectRes = await fetch(`${API_BASE}/proposals/${prop2Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Cookie': clientACookie },
      body: JSON.stringify({ status: 'rejected' })
    });
    const rejectData = await rejectRes.json();

    // Verify on Client side
    const clientSideProp2 = await Proposal.findById(prop2Id);
    const clientRejected = clientSideProp2.status === 'rejected';

    // Verify on Freelancer 2 side via /api/proposals/my-proposals
    const free2SideRes = await (await fetch(`${API_BASE}/proposals/my-proposals`, {
      headers: { 'Cookie': free2Cookie }
    })).json();
    const free2Prop = free2SideRes.data.find(p => p._id === prop2Id);
    const free2Rejected = free2Prop && free2Prop.status === 'rejected';

    if (rejectRes.ok && clientRejected && free2Rejected) {
      console.log('✅ TEST 5 PASSED: Proposal rejected cleanly; status synchronized as "rejected" across both Client and Freelancer dashboards');
      passedTests++;
    } else {
      console.error('❌ TEST 5 FAILED: Rejection sync failure:', { clientRejected, free2Rejected });
    }

    // =========================================================================
    // TEST 6: Client Accepts Proposal 1 -> Status Synchronized & Contract Initiated
    // =========================================================================
    console.log('\n--- TEST 6: Proposal Acceptance, Escrow Lock & Dual-Dashboard Synchronization ---');
    const acceptRes = await fetch(`${API_BASE}/proposals/${prop1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Cookie': clientACookie },
      body: JSON.stringify({ status: 'accepted' })
    });
    const acceptData = await acceptRes.json();

    // Verify DB state
    const acceptedPropDB = await Proposal.findById(prop1Id);
    const gigDB = await Gig.findById(gigId);
    const escrowDB = await Escrow.findOne({ gig: gigId, proposal: prop1Id });

    // Verify Client Dashboard /api/gigs/client/my-gigs
    const clientGigsRes = await (await fetch(`${API_BASE}/gigs/client/my-gigs`, {
      headers: { 'Cookie': clientACookie }
    })).json();
    const clientGigObj = clientGigsRes.data.find(g => g._id === gigId);
    const clientStatusInProgress = clientGigObj && clientGigObj.status === 'in-progress';

    // Verify Freelancer 1 Dashboard /api/gigs/freelancer/my-contracts
    const freeContractsRes = await (await fetch(`${API_BASE}/gigs/freelancer/my-contracts`, {
      headers: { 'Cookie': free1Cookie }
    })).json();
    const freeContractObj = freeContractsRes.data.find(c => c._id === gigId);
    const freelancerContractLive = freeContractObj && freeContractObj.status === 'in-progress';

    // Verify Freelancer 1 proposals tab
    const free1PropsRes = await (await fetch(`${API_BASE}/proposals/my-proposals`, {
      headers: { 'Cookie': free1Cookie }
    })).json();
    const free1PropStatusAccepted = free1PropsRes.data.some(p => p._id === prop1Id && p.status === 'accepted');

    const acceptChecksPass = 
      acceptRes.ok &&
      acceptedPropDB.status === 'accepted' &&
      gigDB.status === 'in-progress' &&
      String(gigDB.freelancer) === free1Id &&
      escrowDB && escrowDB.status === 'held' && escrowDB.amount === 19500 &&
      clientStatusInProgress &&
      freelancerContractLive &&
      free1PropStatusAccepted;

    if (acceptChecksPass) {
      console.log('✅ TEST 6 PASSED: Proposal accepted! Escrow held ₹19,500, gig transitioned to in-progress, synchronized across both Client & Freelancer dashboards');
      passedTests++;
    } else {
      console.error('❌ TEST 6 FAILED: Acceptance sync incomplete:', {
        acceptedPropDB: acceptedPropDB.status,
        gigDB: gigDB.status,
        escrowHeld: Boolean(escrowDB),
        clientStatusInProgress,
        freelancerContractLive,
        free1PropStatusAccepted
      });
    }

    // =========================================================================
    // TEST 7: Duplicate Contract Prevention on Repeated Trigger
    // =========================================================================
    console.log('\n--- TEST 7: Duplicate Contract Prevention on Re-Trigger ---');
    const repeatAcceptRes = await fetch(`${API_BASE}/proposals/${prop1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Cookie': clientACookie },
      body: JSON.stringify({ status: 'accepted' })
    });
    const repeatAcceptData = await repeatAcceptRes.json();

    const escrowCount = await Escrow.countDocuments({ gig: gigId });
    const repeatBlocked = repeatAcceptRes.status === 400 && repeatAcceptData.success === false;

    if (repeatBlocked && escrowCount === 1) {
      console.log(`✅ TEST 7 PASSED: Repeat accept safely rejected with 400 ("${repeatAcceptData.message}"), exactly 1 escrow/contract preserved`);
      passedTests++;
    } else {
      console.error('❌ TEST 7 FAILED: Duplicate contract guard bypassed:', { repeatBlocked, escrowCount });
    }

    // Cleanup
    await Proposal.deleteMany({ gig: gigId });
    await Escrow.deleteMany({ gig: gigId });
    await Transaction.deleteMany({ referenceId: gigId });
    await Gig.findByIdAndDelete(gigId);
    await User.deleteMany({ _id: { $in: [clientAId, clientBId, free1Id, free2Id] } });
    console.log('✓ Cleaned up Phase 5 test artifacts');

  } catch (err) {
    console.error('❌ Unexpected error in Phase 5 verification:', err);
  } finally {
    await mongoose.disconnect();
  }

  console.log('\n====================================================');
  console.log(`RESULT: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('====================================================');

  if (passedTests === totalTests) {
    console.log('🎉 PHASE 5 FULLY VERIFIED & READY FOR SIGN-OFF!');
    process.exit(0);
  } else {
    console.log('❌ PHASE 5 VERIFICATION FAILED');
    process.exit(1);
  }
}

runPhase5Verification();
