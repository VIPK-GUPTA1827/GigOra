const User = require('../models/User');
const { signAccessToken } = require('../utils/tokens');

const makeUser = async (overrides = {}) => {
  const rand = Math.random().toString(36).substring(2, 8);
  const defaults = {
    name: `User ${rand}`,
    username: `user_${rand}`,
    email: `test_${rand}@gmail.com`,
    password: 'Password123!',
    role: 'client',
    isEmailVerified: true,
    walletBalance: 0
  };
  const user = await User.create({ ...defaults, ...overrides });
  const token = signAccessToken(user);
  return { user, token, authHeader: { Authorization: `Bearer ${token}` } };
};

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

module.exports = {
  makeUser,
  bearer
};
