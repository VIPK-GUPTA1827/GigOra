const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');

const ACCESS_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const sha256 = (t) => crypto.createHash('sha256').update(t).digest('hex');

const isMobile = (req) => req.get('x-client-type') === 'mobile';

const cookieBase = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  };
};

const signAccessToken = (user) => jwt.sign(
  { id: user._id.toString(), v: user.tokenVersion || 0 },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

async function issueRefreshToken(user, req) {
  const raw = crypto.randomBytes(48).toString('hex');
  await RefreshToken.create({
    user: user._id,
    tokenHash: sha256(raw),
    expiresAt: new Date(Date.now() + REFRESH_MS),
    userAgent: (req.get('user-agent') || '').slice(0, 200)
  });
  return raw;
}

async function sendAuthTokens(req, res, user) {
  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user, req);

  res.cookie('token', accessToken, { ...cookieBase(), maxAge: ACCESS_MS });
  res.cookie('refreshToken', refreshToken, { ...cookieBase(), maxAge: REFRESH_MS, path: '/api' });

  return isMobile(req)
    ? { token: accessToken, refreshToken }
    : { token: accessToken };
}

function clearAuthCookies(res) {
  res.clearCookie('token', cookieBase());
  res.clearCookie('refreshToken', { ...cookieBase(), path: '/api' });
}

module.exports = {
  sha256,
  isMobile,
  sendAuthTokens,
  clearAuthCookies,
  signAccessToken
};
