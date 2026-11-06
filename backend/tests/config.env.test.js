const { checkEnv } = require('../config/env');

describe('Environment Configuration Guard (checkEnv)', () => {
  const baseValidEnv = {
    NODE_ENV: 'development',
    MONGO_URI: 'mongodb://localhost:27017/gigora_test',
    JWT_SECRET: 'super_secret_jwt_key_that_is_long_enough_32_chars'
  };

  it('valid development configuration passes checkEnv', () => {
    const res = checkEnv(baseValidEnv);
    expect(res.valid).toBe(true);
    expect(res.missing).toHaveLength(0);
    expect(res.warnings).toHaveLength(0);
  });

  it('missing MONGO_URI fails validation', () => {
    const env = { ...baseValidEnv, MONGO_URI: '' };
    const res = checkEnv(env);
    expect(res.valid).toBe(false);
    expect(res.missing).toContain('MONGO_URI');
  });

  it('missing JWT_SECRET fails validation', () => {
    const env = { ...baseValidEnv, JWT_SECRET: undefined };
    const res = checkEnv(env);
    expect(res.valid).toBe(false);
    expect(res.missing).toContain('JWT_SECRET');
  });

  it('in production, missing CLIENT_URL or CORS_ORIGINS fails validation', () => {
    const env = {
      ...baseValidEnv,
      NODE_ENV: 'production'
    };
    const res = checkEnv(env);
    expect(res.valid).toBe(false);
    expect(res.missing).toContain('CLIENT_URL');
    expect(res.missing).toContain('CORS_ORIGINS');

    const validProd = {
      ...env,
      CLIENT_URL: 'https://gig-ora.vercel.app',
      CORS_ORIGINS: 'https://gig-ora.vercel.app'
    };
    const prodRes = checkEnv(validProd);
    expect(prodRes.valid).toBe(true);
  });

  it('short JWT_SECRET (< 32 chars) generates a warning', () => {
    const env = { ...baseValidEnv, JWT_SECRET: 'short_secret' };
    const res = checkEnv(env);
    expect(res.valid).toBe(true);
    expect(res.warnings.length).toBeGreaterThan(0);
    expect(res.warnings[0]).toMatch(/shorter than 32 characters/);
  });
});
