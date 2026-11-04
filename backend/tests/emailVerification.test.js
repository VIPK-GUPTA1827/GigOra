const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

const PASSWORD = 'Str0ng!Passw0rd#1';
const gigPayload = {
  title: 'Full Stack Node and React Development',
  category: 'Web Development',
  description: 'Need a complete web application built with Node and React for my company.',
  budget: 5000
};

describe('Email Verification & Typo Detection', () => {
  it('Typo email returns 400 and suggests correct domain', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Typo User',
        email: '123@gemail.com',
        password: PASSWORD,
        role: 'client'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.suggestion).toBe('123@gmail.com');
  });

  it('Temporary/disposable email is rejected with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Disposable User',
        email: 'attacker@mailinator.com',
        password: PASSWORD,
        role: 'client'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Temporary emails');
  });

  it('Unverified user is blocked (403), verifies via token, handles double click, then succeeds', async () => {
    // 1. Register with real domain
    const reg = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Vipin Gupta',
        email: 'vipin.gupta@gmail.com',
        password: PASSWORD,
        role: 'client'
      });

    expect(reg.status).toBe(201);
    expect(reg.body.requiresVerification).toBe(true);

    const token = reg.body.token;
    const authHeader = { Authorization: `Bearer ${token}` };

    // 2. Before verification: POST /api/gigs is blocked with 403
    const blocked = await request(app)
      .post('/api/gigs')
      .set(authHeader)
      .send(gigPayload);

    expect(blocked.status).toBe(403);
    expect(blocked.body.requiresVerification).toBe(true);

    // 3. Find user in DB to retrieve verification raw token
    const user = await User.findOne({ email: 'vipin.gupta@gmail.com' });
    expect(user.isEmailVerified).toBe(false);

    // For test simulation, generate raw token matching user's stored hash
    const crypto = require('crypto');
    const rawTestToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(rawTestToken).digest('hex');
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // 4. Click verify link
    const v1 = await request(app).get(`/api/auth/verify-email/${rawTestToken}`);
    expect(v1.status).toBe(200);
    expect(v1.body.success).toBe(true);

    // 5. Double click verify link (idempotent, no error)
    const v2 = await request(app).get(`/api/auth/verify-email/${rawTestToken}`);
    expect(v2.status).toBe(200);
    expect(v2.body.alreadyVerified).toBe(true);

    // 6. After verification: POST /api/gigs succeeds
    const successGig = await request(app)
      .post('/api/gigs')
      .set(authHeader)
      .send(gigPayload);

    expect(successGig.status).toBe(201);
  });

  it('Resend verification enforces 60s cooldown (429)', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Cooldown User',
        email: 'cooldown.user@gmail.com',
        password: PASSWORD,
        role: 'client'
      });

    // Immediate second resend triggers 429 cooldown
    const resend = await request(app)
      .post('/api/auth/resend-verification')
      .send({ email: 'cooldown.user@gmail.com' });

    expect(resend.status).toBe(429);
    expect(resend.body.retryAfter).toBeDefined();
    expect(resend.headers['retry-after']).toBeDefined();
  });
});
