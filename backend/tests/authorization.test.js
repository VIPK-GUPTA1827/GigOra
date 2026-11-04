const request = require('supertest');
const app = require('../app');
const Gig = require('../models/Gig');
const { makeUser } = require('./helpers');

describe('Role Authorization and Ownership', () => {
  it('POST /api/gigs returns 403 if called by a freelancer', async () => {
    const { authHeader } = await makeUser({ role: 'freelancer' });

    const res = await request(app)
      .post('/api/gigs')
      .set(authHeader)
      .send({
        title: 'Freelancer Trying To Post Gig',
        description: 'This is a detailed description of the project that has more than thirty characters.',
        category: 'Web Development',
        budget: 5000,
        timeline: '2 weeks'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/notifications/test-email returns 403 when called by non-admin', async () => {
    const { authHeader } = await makeUser({ role: 'client' });

    const res = await request(app)
      .post('/api/notifications/test-email')
      .set(authHeader)
      .send({
        recipient: 'target@example.com'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/gigs/:id returns 403 when client tries to edit someone else gig', async () => {
    const { user: owner } = await makeUser({ role: 'client' });
    const { authHeader: otherClientAuth } = await makeUser({ role: 'client' });

    const gig = await Gig.create({
      title: 'Original Client Project Title Here',
      description: 'Long enough description for this original project to pass schema checks.',
      category: 'Web Development',
      budget: 10000,
      client: owner._id,
      status: 'open'
    });

    const res = await request(app)
      .put(`/api/gigs/${gig._id}`)
      .set(otherClientAuth)
      .send({
        title: 'Hacked Title By Other Client'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
