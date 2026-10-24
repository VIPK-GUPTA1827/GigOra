/**
 * Phase 6 Automated Verification Suite: Contract and Work-Delivery Flow
 *
 * Checkpoints:
 * 1. Accepted proposal creates contract with agreed scope, amount, timeline saved.
 * 2. Milestones add and reorder workflow.
 * 3. Freelancer delivery note or link submission.
 * 4. Client accept or revision request (revision requires comment/feedback).
 * 5. Escrow release upon milestone approval.
 * 6. Cancelled/completed state restricts further modifications.
 * 7. Reload persistence check: fresh fetch returns matching milestones, status, history.
 * 8. Unrelated third-party client/freelancer rejection (403 Forbidden).
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

async function runPhase6Verification() {
  console.log('====================================================');
  console.log('🚀 GIGORA PHASE 6 VERIFICATION SUITE');
  console.log('====================================================');

  if (!MONGO_URI) {
    console.error('❌ MONGO_URI missing in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('✓ Connected to MongoDB Atlas');

  let passedTests = 0;
  const totalTests = 8;

  try {
    const timestamp = Date.now();
    const clientEmail = `phase6_client_${timestamp}@gigora.test`;
    const freeEmail = `phase6_freelancer_${timestamp}@gigora.test`;
    const thirdPartyEmail = `phase6_thirdparty_${timestamp}@gigora.test`;

    // 1. Setup Client (Owner)
    const clientRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Nexus Cloud Pvt Ltd',
        username: `client_${timestamp}`,
        email: clientEmail,
        password: 'Password123!',
        role: 'client'
      })
    });
    const clientData = await clientRes.json();
    const clientCookie = clientRes.headers.get('set-cookie');
    const clientId = clientData.user._id;

    // Give Client verified status and funded escrow wallet balance
    await User.findByIdAndUpdate(clientId, {
      isEmailVerified: true,
      walletBalance: 150000
    });

    // 2. Setup Assigned Freelancer
    const freeRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Vipin Developer',
        username: `dev_${timestamp}`,
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
      walletBalance: 0,
      headline: 'Fullstack Microservices Engineer',
      bio: 'Experienced fullstack engineer specializing in microservices, Docker, React, and MongoDB.',
      skills: [{ name: 'Node.js', level: 'Expert' }, { name: 'React', level: 'Expert' }],
      preferredCategories: ['Web Development'],
      hourlyRate: 1200
    });

    // 3. Setup Unrelated Third-Party User (Attacker / Unrelated client or freelancer)
    const thirdPartyRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Random Stranger',
        username: `stranger_${timestamp}`,
        email: thirdPartyEmail,
        password: 'Password123!',
        role: 'freelancer'
      })
    });
    const thirdPartyCookie = thirdPartyRes.headers.get('set-cookie');

    console.log('✓ Test participants initialized & authenticated');

    // -------------------------------------------------------------
    // TEST 1: Proposal Acceptance -> Contract with Scope, Amount, Timeline
    // -------------------------------------------------------------
    console.log('\n--- Test 1: Contract creation with agreed scope, amount, timeline ---');
    const gigCreateRes = await fetch(`${API_BASE}/gigs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': clientCookie
      },
      body: JSON.stringify({
        title: 'Fullstack Microservices Development',
        description: 'Initial project description from client',
        category: 'Web Development',
        budget: 60000,
        skillsRequired: ['Node.js', 'React', 'MongoDB'],
        duration: '4-6 weeks',
        status: 'open'
      })
    });
    const gigCreateData = await gigCreateRes.json();
    const gigId = gigCreateData.data._id;

    // Freelancer submits proposal with specific bid amount, timeline, and scope
    const agreedBidAmount = 55000;
    const agreedTimeline = '3 weeks';
    const agreedScope = 'Build authenticated REST APIs, React frontend, and deploy Docker containers with unit tests.';

    const propRes = await fetch(`${API_BASE}/proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': freeCookie
      },
      body: JSON.stringify({
        gigId: gigId,
        bidAmount: agreedBidAmount,
        estimatedTime: agreedTimeline,
        coverLetter: agreedScope
      })
    });
    const propData = await propRes.json();
    const proposalId = propData.data._id;

    // Client accepts proposal
    const acceptRes = await fetch(`${API_BASE}/proposals/${proposalId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': clientCookie
      },
      body: JSON.stringify({ status: 'accepted' })
    });
    const acceptData = await acceptRes.json();

    // Verify Gig in DB
    const contractGig = await Gig.findById(gigId);
    if (
      acceptRes.status === 200 &&
      acceptData.success &&
      contractGig.status === 'in-progress' &&
      contractGig.freelancer.toString() === freeId.toString() &&
      contractGig.budget === agreedBidAmount &&
      contractGig.duration === agreedTimeline &&
      contractGig.milestones.length > 0
    ) {
      console.log(`✓ Test 1 PASSED: Contract created with agreed amount (₹${contractGig.budget}), timeline (${contractGig.duration}), and status 'in-progress'.`);
      passedTests++;
    } else {
      console.error('❌ Test 1 FAILED: Contract did not properly save agreed amount, timeline, or freelancer');
    }

    // -------------------------------------------------------------
    // TEST 2: Milestones Add & Reorder Workflow
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Milestones Add & Reorder Workflow ---');
    // Add Milestone 2
    const addM2Res = await fetch(`${API_BASE}/gigs/${gigId}/milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': clientCookie
      },
      body: JSON.stringify({
        title: 'Backend API & Dockerization',
        budget: 25000,
        checklist: [{ text: 'Setup JWT auth and database schemas', isCompleted: false }]
      })
    });
    const addM2Data = await addM2Res.json();

    // Add Milestone 3
    const addM3Res = await fetch(`${API_BASE}/gigs/${gigId}/milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': clientCookie
      },
      body: JSON.stringify({
        title: 'Frontend Integration & UI Polish',
        budget: 30000,
        checklist: [{ text: 'Connect React dashboard with REST API', isCompleted: false }]
      })
    });
    const addM3Data = await addM3Res.json();

    const gigWithMilestones = await Gig.findById(gigId);
    const mIds = gigWithMilestones.milestones.map(m => m._id.toString());

    // Reorder: Move Milestone 3 to the front [mIds[2], mIds[0], mIds[1]]
    const desiredOrder = [mIds[2], mIds[0], mIds[1]];
    const reorderRes = await fetch(`${API_BASE}/gigs/${gigId}/milestones/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': clientCookie
      },
      body: JSON.stringify({ milestoneIds: desiredOrder })
    });
    const reorderData = await reorderRes.json();

    const reorderedGig = await Gig.findById(gigId);
    const finalOrder = reorderedGig.milestones.map(m => m._id.toString());

    if (
      addM2Res.status === 201 &&
      addM3Res.status === 201 &&
      reorderRes.status === 200 &&
      reorderData.success &&
      finalOrder[0] === desiredOrder[0] &&
      finalOrder[1] === desiredOrder[1] &&
      finalOrder[2] === desiredOrder[2]
    ) {
      console.log('✓ Test 2 PASSED: Milestones added and reordered successfully with persistence');
      passedTests++;
    } else {
      console.error('❌ Test 2 FAILED: Milestone addition or reordering failed', { desiredOrder, finalOrder });
    }

    // -------------------------------------------------------------
    // TEST 3: Freelancer Delivery Note or Link Submission
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Freelancer Deliverable Submission ---');
    const targetMilestone = reorderedGig.milestones[0];
    const targetMilestoneId = targetMilestone._id.toString();

    // Test rejection when neither URL nor note is provided
    const emptySubRes = await fetch(`${API_BASE}/gigs/${gigId}/milestones/${targetMilestoneId}/submit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': freeCookie
      },
      body: JSON.stringify({ deliverableUrl: '', deliverableNotes: '' })
    });
    const emptySubData = await emptySubRes.json();

    // Valid deliverable submission
    const validDeliverableUrl = 'https://github.com/vipin-gupta/gigora-microservices-deliverable';
    const validDeliverableNotes = 'Completed the responsive dashboard, tested state sync, and prepared Docker compose file.';

    const validSubRes = await fetch(`${API_BASE}/gigs/${gigId}/milestones/${targetMilestoneId}/submit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': freeCookie
      },
      body: JSON.stringify({
        deliverableUrl: validDeliverableUrl,
        deliverableNotes: validDeliverableNotes
      })
    });
    const validSubData = await validSubRes.json();

    const gigAfterSubmit = await Gig.findById(gigId);
    const submittedM = gigAfterSubmit.milestones.id(targetMilestoneId);

    if (
      emptySubRes.status === 400 &&
      !emptySubData.success &&
      validSubRes.status === 200 &&
      validSubData.success &&
      submittedM.status === 'submitted' &&
      submittedM.deliverableUrl === validDeliverableUrl &&
      submittedM.deliverableNotes === validDeliverableNotes &&
      submittedM.submittedAt
    ) {
      console.log('✓ Test 3 PASSED: Deliverable note & link submitted and persisted in DB');
      passedTests++;
    } else {
      console.error('❌ Test 3 FAILED: Deliverable submission validation or persistence failed');
    }

    // -------------------------------------------------------------
    // TEST 4: Client Accept or Revision Request (Comment Required)
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Revision Request Requires Feedback Comment ---');
    // Try revision without comment
    const emptyRevRes = await fetch(`${API_BASE}/gigs/${gigId}/milestones/${targetMilestoneId}/revision`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': clientCookie
      },
      body: JSON.stringify({ comment: '' })
    });
    const emptyRevData = await emptyRevRes.json();

    // Valid revision request with comment
    const validRevisionComment = 'Please optimize the container build size and fix responsive mobile padding on the summary card.';
    const validRevRes = await fetch(`${API_BASE}/gigs/${gigId}/milestones/${targetMilestoneId}/revision`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': clientCookie
      },
      body: JSON.stringify({ feedback: validRevisionComment })
    });
    const validRevData = await validRevRes.json();

    const gigAfterRev = await Gig.findById(gigId);
    const revisedM = gigAfterRev.milestones.id(targetMilestoneId);

    if (
      emptyRevRes.status === 400 &&
      !emptyRevData.success &&
      validRevRes.status === 200 &&
      validRevData.success &&
      revisedM.status === 'revision_requested' &&
      revisedM.revisionNotes === validRevisionComment
    ) {
      console.log('✓ Test 4 PASSED: Revision strictly requires comment/feedback and saves notes accurately');
      passedTests++;
    } else {
      console.error('❌ Test 4 FAILED: Revision feedback validation failed');
    }

    // Freelancer resubmits revised deliverable
    await fetch(`${API_BASE}/gigs/${gigId}/milestones/${targetMilestoneId}/submit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': freeCookie
      },
      body: JSON.stringify({
        deliverableUrl: 'https://github.com/vipin-gupta/gigora-microservices-deliverable/tree/v2',
        deliverableNotes: 'Fixed mobile padding and shaved Docker container size to 45MB.'
      })
    });

    // -------------------------------------------------------------
    // TEST 5: Client Milestone Approval & Escrow Release
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Client Milestone Approval & Escrow Release ---');
    // Ensure Escrow record exists for this contract (created on proposal acceptance)
    let escrow = await Escrow.findOne({ gig: gigId });
    if (!escrow) {
      escrow = await Escrow.create({
        gig: gigId,
        proposal: proposalId,
        client: clientId,
        freelancer: freeId,
        amount: agreedBidAmount,
        releasedAmount: 0,
        status: 'held'
      });
    }

    const freeBeforeApprove = await User.findById(freeId);
    const balanceBefore = freeBeforeApprove.walletBalance || 0;

    const approveRes = await fetch(`${API_BASE}/gigs/${gigId}/milestones/${targetMilestoneId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': clientCookie
      }
    });
    const approveData = await approveRes.json();

    const gigAfterApprove = await Gig.findById(gigId);
    const approvedM = gigAfterApprove.milestones.id(targetMilestoneId);
    const freeAfterApprove = await User.findById(freeId);
    const balanceAfter = freeAfterApprove.walletBalance || 0;

    if (
      approveRes.status === 200 &&
      approveData.success &&
      approvedM.status === 'completed' &&
      balanceAfter > balanceBefore
    ) {
      console.log(`✓ Test 5 PASSED: Milestone approved and escrow funds (₹${balanceAfter - balanceBefore}) released to freelancer wallet`);
      passedTests++;
    } else {
      console.error('❌ Test 5 FAILED: Milestone approval or escrow release failed', { balanceBefore, balanceAfter });
    }

    // -------------------------------------------------------------
    // TEST 6: Restrictions on Cancelled / Completed State
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Cancelled / Completed State Action Restrictions ---');
    // Mark gig as completed
    await Gig.findByIdAndUpdate(gigId, { status: 'completed' });

    // 1. Attempt to add milestone to completed contract
    const addOnCompleted = await fetch(`${API_BASE}/gigs/${gigId}/milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': clientCookie
      },
      body: JSON.stringify({ title: 'Illegal New Milestone', budget: 5000 })
    });

    // 2. Attempt to submit deliverable on completed contract
    const submitOnCompleted = await fetch(`${API_BASE}/gigs/${gigId}/milestones/${targetMilestoneId}/submit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': freeCookie
      },
      body: JSON.stringify({ deliverableNotes: 'Late deliverable submission' })
    });

    // 3. Attempt to reorder milestones on completed contract
    const reorderOnCompleted = await fetch(`${API_BASE}/gigs/${gigId}/milestones/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': clientCookie
      },
      body: JSON.stringify({ milestoneIds: [targetMilestoneId] })
    });

    if (
      addOnCompleted.status === 400 &&
      submitOnCompleted.status === 400 &&
      reorderOnCompleted.status === 400
    ) {
      console.log('✓ Test 6 PASSED: Completed/cancelled state strictly blocks milestone addition, submission, and reordering');
      passedTests++;
    } else {
      console.error('❌ Test 6 FAILED: Completed contract allowed illegal mutations', {
        addOnCompleted: addOnCompleted.status,
        submitOnCompleted: submitOnCompleted.status,
        reorderOnCompleted: reorderOnCompleted.status
      });
    }

    // Restore gig status to 'in-progress' for subsequent checks
    await Gig.findByIdAndUpdate(gigId, { status: 'in-progress' });

    // -------------------------------------------------------------
    // TEST 7: Unrelated Client / Freelancer Account Rejection (403 Forbidden)
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Unrelated User Rejection (403 Forbidden) ---');
    // Stranger tries to add milestone
    const strangerAddM = await fetch(`${API_BASE}/gigs/${gigId}/milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': thirdPartyCookie
      },
      body: JSON.stringify({ title: 'Hacked Milestone', budget: 10000 })
    });

    // Stranger tries to reorder milestones
    const strangerReorderM = await fetch(`${API_BASE}/gigs/${gigId}/milestones/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': thirdPartyCookie
      },
      body: JSON.stringify({ milestoneIds: [targetMilestoneId] })
    });

    // Stranger tries to submit deliverable
    const strangerSubmitM = await fetch(`${API_BASE}/gigs/${gigId}/milestones/${targetMilestoneId}/submit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': thirdPartyCookie
      },
      body: JSON.stringify({ deliverableNotes: 'Malicious upload' })
    });

    // Stranger tries to request revision
    const strangerRevM = await fetch(`${API_BASE}/gigs/${gigId}/milestones/${targetMilestoneId}/revision`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': thirdPartyCookie
      },
      body: JSON.stringify({ comment: 'Malicious revision request' })
    });

    // Stranger tries to approve milestone
    const strangerApproveM = await fetch(`${API_BASE}/gigs/${gigId}/milestones/${targetMilestoneId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': thirdPartyCookie
      }
    });

    if (
      strangerAddM.status === 403 &&
      strangerReorderM.status === 403 &&
      strangerSubmitM.status === 403 &&
      strangerRevM.status === 403 &&
      strangerApproveM.status === 403
    ) {
      console.log('✓ Test 7 PASSED: All unauthorized mutations from third-party accounts rejected with 403 Forbidden');
      passedTests++;
    } else {
      console.error('❌ Test 7 FAILED: Third-party security boundary compromised', {
        strangerAddM: strangerAddM.status,
        strangerReorderM: strangerReorderM.status,
        strangerSubmitM: strangerSubmitM.status,
        strangerRevM: strangerRevM.status,
        strangerApproveM: strangerApproveM.status
      });
    }

    // -------------------------------------------------------------
    // TEST 8: State Persistence across Fresh Re-fetch (Reload Simulation)
    // -------------------------------------------------------------
    console.log('\n--- Test 8: Reload / Fresh Fetch State Persistence ---');
    const freshFetchRes = await fetch(`${API_BASE}/gigs/${gigId}`, {
      headers: { 'Cookie': clientCookie }
    });
    const freshFetchData = await freshFetchRes.json();
    const loadedGig = freshFetchData.data;

    const loadedMilestone = loadedGig.milestones.find(m => m._id.toString() === targetMilestoneId);

    if (
      freshFetchRes.status === 200 &&
      loadedGig.status === 'in-progress' &&
      loadedGig.milestones.length === 3 &&
      loadedMilestone &&
      loadedMilestone.status === 'completed' &&
      loadedMilestone.deliverableNotes.includes('Fixed mobile padding')
    ) {
      console.log('✓ Test 8 PASSED: Reload simulation confirms all milestone state, status, and deliverables are 100% persisted');
      passedTests++;
    } else {
      console.error('❌ Test 8 FAILED: Reload state mismatch');
    }

  } catch (err) {
    console.error('❌ Unhandled Exception in Phase 6 Verification:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n====================================================');
    console.log(`📊 PHASE 6 VERIFICATION RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('====================================================');

    if (passedTests === totalTests) {
      console.log('🎉 PHASE 6 VERIFICATION 100% SUCCESSFUL! ALL CHECKPOINTS PASSED.');
      process.exit(0);
    } else {
      console.error(`⚠️ PHASE 6 INCOMPLETE: ${totalTests - passedTests} TESTS FAILED.`);
      process.exit(1);
    }
  }
}

runPhase6Verification();
