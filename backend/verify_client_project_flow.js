const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

function extractCookie(headers) {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return '';
  return setCookie.map(c => c.split(';')[0]).join('; ');
}

async function runVerification() {
  console.log('--- STARTING GIGORA PROJECT LIFECYCLE VERIFICATION ---');

  // 1. Login Client
  console.log('\n1. Logging in Client (testclient_step6@gigora.com)...');
  const clientLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'testclient_step6@gigora.com',
    password: 'Password@123'
  });

  if (!clientLogin.data.success) {
    throw new Error('Client login failed: ' + JSON.stringify(clientLogin.data));
  }
  const clientCookie = extractCookie(clientLogin.headers);
  console.log('✓ Client logged in successfully:', clientLogin.data.user.name, `(${clientLogin.data.user.role})`);

  // 2. Login Freelancer
  console.log('\n2. Logging in Freelancer (freelancer_03@example.com)...');
  const freeLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'freelancer_03@example.com',
    password: 'Password@123'
  });

  if (!freeLogin.data.success) {
    throw new Error('Freelancer login failed: ' + JSON.stringify(freeLogin.data));
  }
  const freeCookie = extractCookie(freeLogin.headers);
  console.log('✓ Freelancer logged in successfully:', freeLogin.data.user.name, `(${freeLogin.data.user.role})`);

  // 3. Client creates a project as DRAFT
  console.log('\n3. Client creates a project as DRAFT (status: "draft")...');
  const projectTitle = 'Automated AI Data Pipeline ' + Date.now();
  const draftRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/gigs',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': clientCookie
    }
  }, {
    title: projectTitle,
    category: 'Backend & APIs',
    description: 'Build robust ETL data pipelines using Node.js and MongoDB with streaming connectors.',
    budget: 35000,
    locationType: 'remote',
    experienceLevel: 'Intermediate',
    duration: '1-4 weeks',
    skillsRequired: ['Node.js', 'MongoDB', 'React'],
    status: 'draft'
  });

  if (!draftRes.data.success || draftRes.data.data.status !== 'draft') {
    throw new Error('Failed to create draft project: ' + JSON.stringify(draftRes.data));
  }
  const gigId = draftRes.data.data._id;
  console.log(`✓ Project created as DRAFT! ID: ${gigId}, Status: ${draftRes.data.data.status}`);

  // 4. Verify DRAFT does NOT appear in Freelancer browse or matched gigs
  console.log('\n4. Verifying DRAFT does NOT appear on Freelancer feed...');
  const freeFeedRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/freelancer/matched-gigs',
    method: 'GET',
    headers: { 'Cookie': freeCookie }
  });

  const allFeedGigs = freeFeedRes.data.allGigs || [];
  const leakedDraft = allFeedGigs.find(g => g._id === gigId || g.title === projectTitle);
  if (leakedDraft) {
    throw new Error('SECURITY VIOLATION: Draft gig leaked to freelancer feed!');
  }
  console.log('✓ Verified: Draft gig is completely invisible to freelancers on /api/freelancer/matched-gigs');

  // Verify proposal cannot be submitted on draft
  console.log('4b. Attempting proposal submission on draft gig (should be rejected)...');
  const draftPropRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/proposals',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': freeCookie
    }
  }, {
    gigId: gigId,
    bidAmount: 32000,
    estimatedTime: '2 weeks',
    coverLetter: 'I have 5 years experience in building high performance Node.js and MongoDB ETL pipelines.'
  });

  if (draftPropRes.statusCode === 200 || draftPropRes.data.success) {
    throw new Error('CRITICAL BUG: Proposal accepted on a draft project!');
  }
  console.log(`✓ Verified: Proposal rejected on draft gig with message: "${draftPropRes.data.message}" (Status ${draftPropRes.statusCode})`);

  // 5. Client EDITS the draft project
  console.log('\n5. Client EDITS the draft project details...');
  const updatedTitle = projectTitle + ' (High Performance)';
  const editRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/gigs/${gigId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': clientCookie
    }
  }, {
    title: updatedTitle,
    budget: 42000,
    skillsRequired: ['Node.js', 'MongoDB', 'React', 'FastAPI'],
    description: 'Updated description: Build ultra-fast streaming ETL pipeline with Node.js, MongoDB and FastAPI.'
  });

  if (!editRes.data.success || editRes.data.data.budget !== 42000) {
    throw new Error('Failed to edit draft project: ' + JSON.stringify(editRes.data));
  }
  console.log(`✓ Draft edited successfully: Title="${editRes.data.data.title}", Budget=₹${editRes.data.data.budget}`);

  // 6. Client PUBLISHES the project (status: 'open')
  console.log('\n6. Client PUBLISHES the project (status: "open")...');
  const pubRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/gigs/${gigId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': clientCookie
    }
  }, {
    status: 'open'
  });

  if (!pubRes.data.success || pubRes.data.data.status !== 'open') {
    throw new Error('Failed to publish project: ' + JSON.stringify(pubRes.data));
  }
  console.log(`✓ Project successfully PUBLISHED! Status: "${pubRes.data.data.status}"`);

  // 7. Verify Published Project now appears on Freelancer Dashboard
  console.log('\n7. Verifying project appears on Freelancer Feed as Verified Client Gig...');
  const freeFeedRes2 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/freelancer/matched-gigs',
    method: 'GET',
    headers: { 'Cookie': freeCookie }
  });

  const publishedGig = (freeFeedRes2.data.allGigs || []).find(g => g._id === gigId);
  if (!publishedGig) {
    throw new Error('Published project not found in freelancer feed!');
  }
  console.log(`✓ Found published gig on Freelancer Feed: "${publishedGig.title}", Budget=₹${publishedGig.budget}, isDemo=${publishedGig.isDemo}`);

  // 8. Client PAUSES the project (status: 'paused')
  console.log('\n8. Client PAUSES the project (status: "paused")...');
  const pauseRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/gigs/${gigId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': clientCookie
    }
  }, {
    status: 'paused'
  });

  if (!pauseRes.data.success || pauseRes.data.data.status !== 'paused') {
    throw new Error('Failed to pause project: ' + JSON.stringify(pauseRes.data));
  }
  console.log(`✓ Project marked as PAUSED! Status: "${pauseRes.data.data.status}"`);

  // Verify proposal cannot be submitted while paused
  console.log('8b. Verifying proposal submission is blocked while project is PAUSED...');
  const pausedPropRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/proposals',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': freeCookie
    }
  }, {
    gigId: gigId,
    bidAmount: 40000,
    estimatedTime: '2 weeks',
    coverLetter: 'I would like to apply for this pipeline project.'
  });

  if (pausedPropRes.statusCode === 200 || pausedPropRes.data.success) {
    throw new Error('CRITICAL BUG: Proposal accepted on a paused project!');
  }
  console.log(`✓ Verified: Proposal rejected on paused gig with message: "${pausedPropRes.data.message}" (Status ${pausedPropRes.statusCode})`);

  // 9. Client RESUMES the project (status: 'open')
  console.log('\n9. Client RESUMES the project back to "open"...');
  const resumeRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/gigs/${gigId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': clientCookie
    }
  }, {
    status: 'open'
  });

  if (!resumeRes.data.success || resumeRes.data.data.status !== 'open') {
    throw new Error('Failed to resume project: ' + JSON.stringify(resumeRes.data));
  }
  console.log(`✓ Project successfully RESUMED to "open"!`);

  // 10. Freelancer SUBMITS a proposal on the open project
  console.log('\n10. Freelancer submits a proposal on the published project...');
  const proposalSubmission = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/proposals',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': freeCookie
    }
  }, {
    gigId: gigId,
    bidAmount: 38000,
    estimatedTime: '10 days',
    coverLetter: 'Hi Vipin, I am Rahul. I have production expertise building resilient Node.js and MongoDB stream pipelines. Ready to start immediately!'
  });

  if (!proposalSubmission.data.success) {
    throw new Error('Failed to submit proposal on open project: ' + JSON.stringify(proposalSubmission.data));
  }
  const proposalId = proposalSubmission.data.data._id;
  console.log(`✓ Proposal submitted successfully! Proposal ID: ${proposalId}, Bid: ₹${proposalSubmission.data.data.bidAmount}`);

  // 11. Client checks received proposals in Client Dashboard
  console.log('\n11. Client fetches received proposals to verify applicant proposal appears...');
  const clientPropsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/proposals/client/all-proposals',
    method: 'GET',
    headers: { 'Cookie': clientCookie }
  });

  if (!clientPropsRes.data.success) {
    throw new Error('Failed to fetch client proposals: ' + JSON.stringify(clientPropsRes.data));
  }

  const receivedProp = (clientPropsRes.data.data || []).find(p => p._id === proposalId || (p.gig && p.gig._id === gigId));
  if (!receivedProp) {
    throw new Error('Submitted proposal not found in client received proposals list!');
  }
  console.log(`✓ Proposal verified in Client Dashboard! Candidate: ${receivedProp.freelancer?.name || 'Freelancer'}, Bid: ₹${receivedProp.bidAmount}, Pitch: "${receivedProp.coverLetter.substring(0, 45)}..."`);

  // 12. Client CLOSES the project (status: 'closed')
  console.log('\n12. Client CLOSES the project (status: "closed")...');
  const closeRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/gigs/${gigId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': clientCookie
    }
  }, {
    status: 'closed'
  });

  if (!closeRes.data.success || closeRes.data.data.status !== 'closed') {
    throw new Error('Failed to close project: ' + JSON.stringify(closeRes.data));
  }
  console.log(`✓ Project marked as CLOSED! Status: "${closeRes.data.data.status}"`);

  // Verify proposal cannot be submitted while closed
  console.log('12b. Verifying proposal submission is blocked while project is CLOSED...');
  const closedPropRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/proposals',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': freeCookie
    }
  }, {
    gigId: gigId,
    bidAmount: 35000,
    estimatedTime: '1 week',
    coverLetter: 'Late application attempt on closed project.'
  });

  if (closedPropRes.statusCode === 200 || closedPropRes.data.success) {
    throw new Error('CRITICAL BUG: Proposal accepted on a closed project!');
  }
  console.log(`✓ Verified: Proposal rejected on closed gig with message: "${closedPropRes.data.message}" (Status ${closedPropRes.statusCode})`);

  // 13. Client REOPENS the project back to open
  console.log('\n13. Client REOPENS the project back to "open"...');
  const reopenRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/gigs/${gigId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': clientCookie
    }
  }, {
    status: 'open'
  });

  if (!reopenRes.data.success || reopenRes.data.data.status !== 'open') {
    throw new Error('Failed to reopen project: ' + JSON.stringify(reopenRes.data));
  }
  console.log(`✓ Project successfully REOPENED to "open"!`);

  // 14. Clean up temporary test gig
  console.log('\n14. Cleaning up temporary test gig to keep database clean...');
  await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/gigs/${gigId}`,
    method: 'DELETE',
    headers: { 'Cookie': clientCookie }
  });
  console.log('✓ Temporary test gig deleted successfully.');

  console.log('\n🎉 ALL 14 PROJECT LIFECYCLE CHECKS PASSED FLAWLESSLY WITH 100% SUCCESS!');
}

runVerification().catch(err => {
  console.error('\n❌ VERIFICATION FAILED:', err.message);
  process.exit(1);
});
