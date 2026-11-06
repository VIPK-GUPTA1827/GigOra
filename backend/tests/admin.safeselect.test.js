const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { makeUser } = require('./helpers');

describe('Admin Users Allowlist Projection (SAFE_USER_SELECT)', () => {
  it('GET /api/admin/users returns 403 when called by non-admin', async () => {
    const { authHeader } = await makeUser({ role: 'client' });
    const res = await request(app)
      .get('/api/admin/users')
      .set(authHeader);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/admin/users does not leak resetPasswordToken', async () => {
    const { authHeader: adminAuth } = await makeUser({ role: 'admin' });
    await makeUser({
      role: 'freelancer',
      resetPasswordToken: 'sensitive_leakable_reset_token_xyz',
      resetPasswordExpire: Date.now() + 3600000
    });

    const res = await request(app)
      .get('/api/admin/users')
      .set(adminAuth);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    for (const u of res.body.data) {
      expect(u.resetPasswordToken).toBeUndefined();
      expect(u.resetPasswordExpire).toBeUndefined();
    }
  });

  it('GET /api/admin/users does not leak emailVerificationToken', async () => {
    const { authHeader: adminAuth } = await makeUser({ role: 'admin' });
    await makeUser({
      role: 'client',
      emailVerificationToken: 'sensitive_leakable_verification_token_123',
      emailVerificationExpire: Date.now() + 3600000
    });

    const res = await request(app)
      .get('/api/admin/users')
      .set(adminAuth);

    expect(res.status).toBe(200);
    for (const u of res.body.data) {
      expect(u.emailVerificationToken).toBeUndefined();
      expect(u.emailVerificationExpire).toBeUndefined();
    }
  });

  it('GET /api/admin/users returns safe fields', async () => {
    const { authHeader: adminAuth } = await makeUser({ role: 'admin' });
    const target = await makeUser({
      name: 'Verify Safe Projection',
      role: 'freelancer',
      headline: 'Fullstack Dev'
    });

    const res = await request(app)
      .get('/api/admin/users')
      .set(adminAuth);

    expect(res.status).toBe(200);
    const found = res.body.data.find(u => u._id === String(target.user._id));
    expect(found).toBeDefined();
    expect(found.name).toBe('Verify Safe Projection');
    expect(found.role).toBe('freelancer');
    expect(found.headline).toBe('Fullstack Dev');
    expect(found.password).toBeUndefined();
  });
});
