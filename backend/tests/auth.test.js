const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Auth Endpoints', () => {
  it('POST /api/auth/register creates user and returns 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Vipin Test',
        username: 'vipintest1',
        email: 'vipin.test@gmail.com',
        password: 'Password123!',
        role: 'freelancer'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('vipin.test@gmail.com');
  });

  it('POST /api/auth/register returns 400 when validation fails (short password)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Short Pass',
        username: 'shortpass',
        email: 'shortpass@gmail.com',
        password: '123',
        role: 'freelancer'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login returns 200 and access token, and sets auth cookies', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        username: 'loginuser',
        email: 'login.user@gmail.com',
        password: 'Password123!',
        role: 'client'
      });

    // Mark email verified for authorized login flow
    await User.updateOne({ email: 'login.user@gmail.com' }, { isEmailVerified: true });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login.user@gmail.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('POST /api/auth/login with x-client-type: mobile returns refreshToken in body', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Mobile User',
        username: 'mobileuser',
        email: 'mobile.user@gmail.com',
        password: 'Password123!',
        role: 'client'
      });

    // Mark email verified for authorized login flow
    await User.updateOne({ email: 'mobile.user@gmail.com' }, { isEmailVerified: true });

    const res = await request(app)
      .post('/api/auth/login')
      .set('x-client-type', 'mobile')
      .send({
        email: 'mobile.user@gmail.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('POST /api/auth/login returns 403 when email is not verified', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Unverified Guy',
        username: 'unverifiedguy',
        email: 'unverified.guy@gmail.com',
        password: 'Password123!',
        role: 'client'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'unverified.guy@gmail.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.requiresVerification).toBe(true);
    expect(res.body.message).toMatch(/verify your email/i);
  });

  it('POST /api/auth/login returns 401 on wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Wrong Pass',
        username: 'wrongpass',
        email: 'wrong.pass@gmail.com',
        password: 'Password123!',
        role: 'client'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong.pass@gmail.com',
        password: 'WrongPassword999!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login neutralizes NoSQL operator injection', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: { $gt: '' },
        password: 'Password123!'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/refresh rotates token and blocks reuse of consumed token', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Refresh Tester',
        username: 'refreshtest',
        email: 'refresh.test@gmail.com',
        password: 'Password123!',
        role: 'freelancer'
      });

    // Mark email verified for login flow
    await User.updateOne({ email: 'refresh.test@gmail.com' }, { isEmailVerified: true });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'refresh.test@gmail.com',
        password: 'Password123!'
      });

    const cookies = loginRes.headers['set-cookie'];
    const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();

    // 1. Silent refresh with valid refreshToken cookie
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [refreshCookie]);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.token).toBeDefined();

    // 2. Reuse of consumed token must fail (Token Rotation security)
    const reuseRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [refreshCookie]);

    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.message).toContain('Session expired');
  });
});
