/**
 * Phase 7 Automated Verification Suite: Notifications & Email Flow
 *
 * Checkpoints (from Phase 7 Specification):
 * 1. In-app notifications generated for all core lifecycle events:
 *    - proposal_submitted (to Client)
 *    - proposal_accepted (to Freelancer)
 *    - proposal_rejected (to competing Freelancers)
 *    - deliverable_submitted (to Client)
 *    - revision_requested (to Freelancer)
 * 2. Notification links to correct destination page (destinationUrl & tabs).
 * 3. Read/unread state is accurately preserved across reloads.
 * 4. Email failure strictly returns failure (no false "sent" success).
 * 5. Email logs match recipient and delivery status.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Gig = require('./models/Gig');
const Proposal = require('./models/Proposal');
const Notification = require('./models/Notification');
const EmailLog = require('./models/EmailLog');
const Escrow = require('./models/Escrow');

const MONGO_URI = process.env.MONGO_URI;
const API_BASE = 'http://localhost:5000/api';

async function runPhase7Verification() {
  console.log('====================================================');
  console.log('🚀 GIGORA PHASE 7 VERIFICATION SUITE: NOTIFICATIONS & EMAILS');
  console.log('====================================================');

  if (!MONGO_URI) {
    console.error('❌ MONGO_URI missing in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('✓ Connected to MongoDB Atlas');

  let passedTests = 0;
  const totalTests = 5;

  try {
    const timestamp = Date.now();
    const clientEmail = `phase7_client_${timestamp}@gigora.test`;
    const free1Email = `phase7_free1_${timestamp}@gigora.test`;
    const free2Email = `phase7_free2_${timestamp}@gigora.test`;

    // 1. Setup Client
    const clientRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Vipin Enterprise Systems',
        username: `client_p7_${timestamp}`,
        email: clientEmail,
        password: 'Password123!',
        role: 'client'
      })
    });
    const clientData = await clientRes.json();
    const clientCookie = clientRes.headers.get('set-cookie');
    const clientId = clientData.user._id;

    await User.findByIdAndUpdate(clientId, {
      isEmailVerified: true,
      walletBalance: 200000
    });

    // 2. Setup Freelancer 1 (Winning bidder)
    const free1Res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arjun Mehta',
        username: `arjun_${timestamp}`,
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
      walletBalance: 0,
      headline: 'Senior Cloud & Backend Architect',
      bio: 'Expert architect building distributed systems with Node.js and MongoDB.',
      skills: [{ name: 'Node.js', level: 'Expert' }],
      preferredCategories: ['Web Development'],
      hourlyRate: 1500
    });

    // 3. Setup Freelancer 2 (Competing bidder to test rejection notification)
    const free2Res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Suresh Raina',
        username: `suresh_${timestamp}`,
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
      walletBalance: 0,
      headline: 'Fullstack Web Engineer',
      bio: 'Fullstack web engineer with focus on React and modern APIs.',
      skills: [{ name: 'React', level: 'Expert' }],
      preferredCategories: ['Web Development'],
      hourlyRate: 1000
    });

    console.log('✓ Client and Freelancers registered and primed with verified profiles');

    // Client posts an open gig
    const gigRes = await fetch(`${API_BASE}/gigs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': clientCookie },
      body: JSON.stringify({
        title: `Enterprise Cloud Notification Engine ${timestamp}`,
        description: 'Complete resilient notification and messaging hub with transactional emails.',
        category: 'Web Development',
        budget: 45000,
        skillsRequired: ['Node.js', 'React'],
        duration: '2-4 weeks',
        status: 'open'
      })
    });
    const gigData = await gigRes.json();
    const gigId = gigData.data._id;

    // -------------------------------------------------------------
    // TEST 1: Lifecycle Event In-App Notification Generation
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: In-App Notification Generation Across Lifecycle Events ---');

    // 1a. Freelancer 1 submits proposal -> triggers proposal_submitted to Client
    const prop1Res = await fetch(`${API_BASE}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': free1Cookie },
      body: JSON.stringify({
        gigId,
        bidAmount: 42000,
        estimatedTime: '2 weeks',
        coverLetter: 'I will design and build this notification engine with zero failure tolerance.'
      })
    });
    const prop1Data = await prop1Res.json();
    const prop1Id = prop1Data.data._id;

    // 1b. Freelancer 2 submits proposal
    const prop2Res = await fetch(`${API_BASE}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': free2Cookie },
      body: JSON.stringify({
        gigId,
        bidAmount: 44000,
        estimatedTime: '3 weeks',
        coverLetter: 'Ready to build this cloud notification platform.'
      })
    });
    const prop2Data = await prop2Res.json();

    // Verify Client received proposal_submitted notifications
    const clientNotifsAfterProposals = await Notification.find({
      recipient: clientId,
      type: 'proposal_submitted',
      referenceId: gigId
    });

    // 1c. Client accepts Freelancer 1 proposal -> triggers proposal_accepted to Free1 & proposal_rejected to Free2
    await fetch(`${API_BASE}/proposals/${prop1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Cookie': clientCookie },
      body: JSON.stringify({ status: 'accepted' })
    });

    const free1AcceptedNotif = await Notification.findOne({
      recipient: free1Id,
      type: 'proposal_accepted',
      referenceId: gigId
    });

    const free2RejectedNotif = await Notification.findOne({
      recipient: free2Id,
      type: 'proposal_rejected',
      referenceId: gigId
    });

    // 1d. Freelancer 1 submits milestone deliverable -> triggers deliverable_submitted to Client
    const gigDoc = await Gig.findById(gigId);
    const mId = gigDoc.milestones[0]._id.toString();

    await fetch(`${API_BASE}/gigs/${gigId}/milestones/${mId}/submit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Cookie': free1Cookie },
      body: JSON.stringify({
        deliverableUrl: 'https://github.com/vipin/notification-engine-v1',
        deliverableNotes: 'Initial deliverable with Kafka queue integration and Nodemailer sender.'
      })
    });

    const clientDeliverableNotif = await Notification.findOne({
      recipient: clientId,
      type: 'deliverable_submitted',
      referenceId: gigId
    });

    // 1e. Client requests revision -> triggers revision_requested to Freelancer 1
    const revisionComment = 'Please add automated retry backoff on SMTP timeouts before approval.';
    await fetch(`${API_BASE}/gigs/${gigId}/milestones/${mId}/revision`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Cookie': clientCookie },
      body: JSON.stringify({ feedback: revisionComment })
    });

    const free1RevisionNotif = await Notification.findOne({
      recipient: free1Id,
      type: 'revision_requested',
      referenceId: gigId
    });

    if (
      clientNotifsAfterProposals.length >= 2 &&
      free1AcceptedNotif &&
      free2RejectedNotif &&
      clientDeliverableNotif &&
      free1RevisionNotif &&
      free1RevisionNotif.message.includes(revisionComment)
    ) {
      console.log('✅ TEST 1 PASSED: All 5 core lifecycle events generate accurate in-app notifications in MongoDB');
      passedTests++;
    } else {
      console.error('❌ TEST 1 FAILED: Missing in-app notifications for one or more lifecycle events', {
        proposalsCount: clientNotifsAfterProposals.length,
        free1Accepted: !!free1AcceptedNotif,
        free2Rejected: !!free2RejectedNotif,
        deliverableNotif: !!clientDeliverableNotif,
        revisionNotif: !!free1RevisionNotif
      });
    }

    // -------------------------------------------------------------
    // TEST 2: Notification Destination Link Verification
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Notification Destination Link Validation ---');

    // Check Client proposal notification link
    const clientProposalLink = clientNotifsAfterProposals[0].destinationUrl;
    // Check Freelancer acceptance link
    const freeAcceptedLink = free1AcceptedNotif.destinationUrl;
    // Check Client deliverable notification link
    const clientDeliverableLink = clientDeliverableNotif.destinationUrl;
    // Check Freelancer revision notification link
    const freeRevisionLink = free1RevisionNotif.destinationUrl;

    const isClientPropCorrect = clientProposalLink === `/client/dashboard?tab=proposals&gigId=${gigId}`;
    const isFreeAcceptCorrect = freeAcceptedLink === `/freelancer/dashboard?tab=contracts&gigId=${gigId}`;
    const isClientDelivCorrect = clientDeliverableLink === `/client/dashboard?tab=projects&gigId=${gigId}`;
    const isFreeRevCorrect = freeRevisionLink === `/freelancer/dashboard?tab=contracts&gigId=${gigId}`;

    if (isClientPropCorrect && isFreeAcceptCorrect && isClientDelivCorrect && isFreeRevCorrect) {
      console.log('✅ TEST 2 PASSED: All notification destination URLs route to the exact expected project/contract page');
      passedTests++;
    } else {
      console.error('❌ TEST 2 FAILED: Notification destination links mismatch', {
        clientProposalLink,
        freeAcceptedLink,
        clientDeliverableLink,
        freeRevisionLink
      });
    }

    // -------------------------------------------------------------
    // TEST 3: Read/Unread State Refresh Persistence
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Read/Unread State Persistence Across Reload ---');

    // Client marks a single notification as read via API
    const targetNotifId = clientNotifsAfterProposals[0]._id.toString();
    const markSingleRes = await fetch(`${API_BASE}/notifications/mark-read/${targetNotifId}`, {
      method: 'PUT',
      headers: { 'Cookie': clientCookie }
    });
    const markSingleData = await markSingleRes.json();

    // Verify directly in DB and via fresh API query
    const clientFetchRes = await fetch(`${API_BASE}/notifications`, {
      headers: { 'Cookie': clientCookie }
    });
    const clientFetchData = await clientFetchRes.json();
    const reloadedNotif = clientFetchData.data.find(n => n._id.toString() === targetNotifId);

    // Freelancer marks all notifications as read via API
    const markAllRes = await fetch(`${API_BASE}/notifications/mark-read`, {
      method: 'PUT',
      headers: { 'Cookie': free1Cookie }
    });
    const markAllData = await markAllRes.json();

    const freeFetchRes = await fetch(`${API_BASE}/notifications`, {
      headers: { 'Cookie': free1Cookie }
    });
    const freeFetchData = await freeFetchRes.json();
    const unreadCountForFree = freeFetchData.data.filter(n => !n.read).length;

    if (
      markSingleRes.status === 200 &&
      markSingleData.success &&
      reloadedNotif &&
      reloadedNotif.read === true &&
      markAllRes.status === 200 &&
      markAllData.success &&
      unreadCountForFree === 0
    ) {
      console.log('✅ TEST 3 PASSED: Read/unread state persists across reload and mark-all clears unread count');
      passedTests++;
    } else {
      console.error('❌ TEST 3 FAILED: Read state persistence failed', {
        singleSuccess: markSingleData.success,
        reloadedRead: reloadedNotif?.read,
        unreadCountForFree
      });
    }

    // -------------------------------------------------------------
    // TEST 4: Email Failure Handling (Strictly No False Success)
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Email Failure Rejection (No False Success) ---');

    // Trigger test email with simulated failure
    const failEmailRes = await fetch(`${API_BASE}/notifications/test-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': clientCookie },
      body: JSON.stringify({
        email: clientEmail,
        simulateFailure: true
      })
    });
    const failEmailData = await failEmailRes.json();

    // Trigger test email with invalid recipient format
    const badEmailRes = await fetch(`${API_BASE}/notifications/test-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': clientCookie },
      body: JSON.stringify({
        email: 'invalid-email-without-at',
        simulateFailure: false
      })
    });
    const badEmailData = await badEmailRes.json();

    if (
      failEmailRes.status >= 400 &&
      failEmailData.success === false &&
      failEmailData.status === 'failed' &&
      badEmailRes.status === 400 &&
      badEmailData.success === false
    ) {
      console.log('✅ TEST 4 PASSED: Failed email dispatches strictly return failure responses with no false success');
      passedTests++;
    } else {
      console.error('❌ TEST 4 FAILED: Email failure returned misleading success status', {
        failStatus: failEmailRes.status,
        failSuccess: failEmailData.success,
        badStatus: badEmailRes.status
      });
    }

    // -------------------------------------------------------------
    // TEST 5: Email Logs Recipient and Delivery Status Match
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Email Logs Recipient and Delivery Status Matching ---');

    // Trigger a valid test email to confirm successful delivery logging
    const goodEmailRes = await fetch(`${API_BASE}/notifications/test-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': clientCookie },
      body: JSON.stringify({ email: clientEmail })
    });
    const goodEmailData = await goodEmailRes.json();

    // Query email logs via API
    const emailLogsRes = await fetch(`${API_BASE}/notifications/email-logs`, {
      headers: { 'Cookie': clientCookie }
    });
    const emailLogsData = await emailLogsRes.json();
    const logs = emailLogsData.data;

    // Check that we have logged entries for clientEmail with both 'sent' and 'failed'
    const sentLog = logs.find(l => l.recipient === clientEmail.toLowerCase() && l.status === 'sent');
    const failedLog = logs.find(l => l.recipient === clientEmail.toLowerCase() && l.status === 'failed');

    if (
      goodEmailRes.status === 200 &&
      goodEmailData.success === true &&
      sentLog &&
      sentLog.recipient === clientEmail.toLowerCase() &&
      failedLog &&
      failedLog.recipient === clientEmail.toLowerCase() &&
      failedLog.error.includes('timeout')
    ) {
      console.log('✅ TEST 5 PASSED: Email logs accurately match recipient email, event type, and delivery status (sent/failed)');
      passedTests++;
    } else {
      console.error('❌ TEST 5 FAILED: Email logs mismatch with actual delivery status', {
        goodSuccess: goodEmailData.success,
        sentLog: !!sentLog,
        failedLog: !!failedLog
      });
    }

  } catch (err) {
    console.error('❌ Unhandled Exception in Phase 7 Verification:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n====================================================');
    console.log(`📊 PHASE 7 VERIFICATION RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('====================================================');

    if (passedTests === totalTests) {
      console.log('🎉 PHASE 7 VERIFICATION 100% SUCCESSFUL! ALL CHECKPOINTS PASSED.');
      process.exit(0);
    } else {
      console.error(`⚠️ PHASE 7 INCOMPLETE: ${totalTests - passedTests} TESTS FAILED.`);
      process.exit(1);
    }
  }
}

runPhase7Verification();
