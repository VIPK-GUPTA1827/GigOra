const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Gig = require('../models/Gig');
const Proposal = require('../models/Proposal');
const Escrow = require('../models/Escrow');
const { makeUser } = require('./helpers');

describe('Escrow & Proposal Acceptance (Atomic Transactions)', () => {
  it('PUT /api/proposals/:id holds escrow, changes gig status, and deducts balance', async () => {
    const budget = 5000;
    const initialBalance = 10000;

    const { user: client, authHeader: clientAuth } = await makeUser({
      role: 'client',
      walletBalance: initialBalance
    });
    const { user: freelancer } = await makeUser({ role: 'freelancer' });

    const gig = await Gig.create({
      title: 'Full Stack Web App Development',
      description: 'Long enough description to satisfy validation schema requirement of 30 chars.',
      category: 'Web Development',
      budget,
      client: client._id,
      status: 'open'
    });

    const proposal = await Proposal.create({
      gig: gig._id,
      freelancer: freelancer._id,
      coverLetter: 'I am an expert full stack dev and can build this perfectly.',
      bidAmount: budget,
      estimatedTime: '1 week',
      status: 'pending'
    });

    const res = await request(app)
      .put(`/api/proposals/${proposal._id}`)
      .set(clientAuth)
      .send({ status: 'accepted' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify Gig status changed to in-progress
    const updatedGig = await Gig.findById(gig._id);
    expect(updatedGig.status).toBe('in-progress');
    expect(updatedGig.freelancer.toString()).toBe(freelancer._id.toString());

    // Verify Proposal status changed to accepted
    const updatedProposal = await Proposal.findById(proposal._id);
    expect(updatedProposal.status).toBe('accepted');

    // Verify Escrow created
    const escrow = await Escrow.findOne({ gig: gig._id });
    expect(escrow).not.toBeNull();
    expect(escrow.amount).toBe(budget);
    expect(escrow.status).toBe('held');

    // Verify Client wallet balance deducted
    const updatedClient = await User.findById(client._id);
    expect(updatedClient.walletBalance).toBe(initialBalance - budget);
  });

  it('Concurrent double-accept race condition results in exactly 1 success and 1 409 conflict', async () => {
    const budget = 4000;
    const initialBalance = 10000;

    const { user: client, authHeader: clientAuth } = await makeUser({
      role: 'client',
      walletBalance: initialBalance
    });
    const { user: freelancer } = await makeUser({ role: 'freelancer' });

    const gig = await Gig.create({
      title: 'Mobile App Flutter Development',
      description: 'Long enough description to satisfy validation schema requirement of 30 chars.',
      category: 'Mobile App Development',
      budget,
      client: client._id,
      status: 'open'
    });

    const proposal = await Proposal.create({
      gig: gig._id,
      freelancer: freelancer._id,
      coverLetter: 'I have 5 years flutter experience and can deliver on time.',
      bidAmount: budget,
      estimatedTime: '5 days',
      status: 'pending'
    });

    // Fire two parallel accept requests simultaneously (race condition)
    const [res1, res2] = await Promise.all([
      request(app).put(`/api/proposals/${proposal._id}`).set(clientAuth).send({ status: 'accepted' }),
      request(app).put(`/api/proposals/${proposal._id}`).set(clientAuth).send({ status: 'accepted' })
    ]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([200, 409]);

    // Verify Escrow is created only once
    const escrows = await Escrow.find({ gig: gig._id });
    expect(escrows.length).toBe(1);

    // Verify Wallet balance is deducted only once (10000 - 4000 = 6000, NOT 2000)
    const updatedClient = await User.findById(client._id);
    expect(updatedClient.walletBalance).toBe(initialBalance - budget);
  });
});
