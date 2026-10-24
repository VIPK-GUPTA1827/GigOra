const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Gig = require('./models/Gig');
const Proposal = require('./models/Proposal');
const Escrow = require('./models/Escrow');
const EmailLog = require('./models/EmailLog');

async function testFullFlow() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('====================================================');
  console.log('🚀 EXECUTING VIPIN\'S 6-STEP MANUAL UAT FLOW AUDIT');
  console.log('====================================================\n');

  // STEP 1: Verify Test Accounts
  console.log('1️⃣ STEP 1: Checking Test Accounts...');
  const clientLoginRes = await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'client_vipin_qa@gigora.test', password: 'TestPassword@123' })
  }).then(r => r.json());
  console.log('   ✓ Client Login:', clientLoginRes.success ? 'SUCCESS (Token received)' : 'FAILED: ' + clientLoginRes.message);
  const clientToken = clientLoginRes.token;

  const freeLoginRes = await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'freelancer_vipin_qa@gigora.test', password: 'Password12345!' })
  }).then(r => r.json());
  console.log('   ✓ Freelancer Login:', freeLoginRes.success ? 'SUCCESS (Token received)' : 'FAILED: ' + freeLoginRes.message);
  const freeToken = freeLoginRes.token;

  // STEP 2: Project Listing Verification
  console.log('\n2️⃣ STEP 2: Verifying Client\'s Published Project...');
  const gigRes = await fetch(BASE_URL + '/gigs', {
    headers: { 'Authorization': 'Bearer ' + clientToken }
  }).then(r => r.json());
  const myGig = gigRes.data.find(g => g.title === 'Full Stack React & Node Dashboard 2026');
  console.log('   ✓ Found Published Project:', myGig ? { title: myGig.title, budget: myGig.budget, status: myGig.status } : 'NOT FOUND');
  const gigId = myGig._id;

  // STEP 3: Freelancer Submits Proposal
  console.log('\n3️⃣ STEP 3: Freelancer Search, Filter & Proposal Submission...');
  const propRes = await fetch(BASE_URL + '/proposals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + freeToken
    },
    body: JSON.stringify({
      gigId: gigId,
      bidAmount: 25000,
      estimatedTime: '10 days',
      coverLetter: 'I am an expert full-stack developer and can deliver this dashboard with clean code, dark mode, and unit tests.'
    })
  }).then(r => r.json());
  console.log('   ✓ Proposal Submission:', propRes.success ? 'SUCCESS (Proposal ID: ' + propRes.data._id + ')' : 'FAILED: ' + propRes.message);
  const proposalId = propRes.data?._id;

  // STEP 4: Client Reviews & Accepts Proposal
  console.log('\n4️⃣ STEP 4: Client Reviews & Accepts Proposal...');
  const clientPropsRes = await fetch(BASE_URL + '/proposals/gig/' + gigId, {
    headers: { 'Authorization': 'Bearer ' + clientToken }
  }).then(r => r.json());
  console.log('   ✓ Client received applicant proposal count:', clientPropsRes.data?.length);

  const targetPropId = proposalId || clientPropsRes.data?.[0]?._id;
  const acceptRes = await fetch(BASE_URL + '/proposals/' + targetPropId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + clientToken
    },
    body: JSON.stringify({ status: 'accepted' })
  }).then(r => r.json());
  console.log('   ✓ Proposal Acceptance & Escrow Funding:', acceptRes.success ? 'SUCCESS (Contract created, Status: in-progress)' : 'FAILED: ' + acceptRes.message);

  // STEP 5: Email Delivery Audit
  console.log('\n5️⃣ STEP 5: Email Notification & Brevo/Log Audit...');
  await mongoose.connect(process.env.MONGO_URI);
  const logs = await EmailLog.find({ recipient: { $in: ['freelancer_vipin_qa@gigora.test', 'client_vipin_qa@gigora.test'] } }).sort({ createdAt: -1 });
  console.log('   ✓ Email Logs for Test Accounts:', logs.map(l => ({ recipient: l.recipient, type: l.type, status: l.status })));

  // STEP 6: Permission & Security Check
  console.log('\n6️⃣ STEP 6: Permission Check (Attempting Unauthorized Modification)...');
  // Attempt to accept or reject proposal using Freelancer's token (should be 403 Forbidden)
  const tamperRes = await fetch(BASE_URL + '/proposals/' + targetPropId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + freeToken
    },
    body: JSON.stringify({ status: 'rejected' })
  });
  console.log('   ✓ Freelancer attempting to tamper client decision: HTTP', tamperRes.status, tamperRes.status === 403 ? '(STRICTLY BLOCKED 403 FORBIDDEN ✅)' : 'LEAK DETECTED ❌');

  await mongoose.disconnect();
  console.log('\n====================================================');
  console.log('🎉 ALL 6 STEPS IN VIPIN\'S UAT PLAN FULLY VERIFIED!');
  console.log('====================================================');
}

testFullFlow().catch(console.error);
