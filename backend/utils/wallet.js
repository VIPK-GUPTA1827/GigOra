const User = require('../models/User');
const AppError = require('./AppError');

/**
 * Atomically credits a user's walletBalance using $inc
 */
async function credit(userId, amount, session) {
  const user = await User.findOneAndUpdate(
    { _id: userId },
    { $inc: { walletBalance: amount } },
    { returnDocument: 'after', session }
  );
  if (!user) throw new AppError('User not found', 404);
  return user;
}

/**
 * Atomically debits a user's walletBalance if balance >= amount
 */
async function debit(userId, amount, session) {
  const user = await User.findOneAndUpdate(
    { _id: userId, walletBalance: { $gte: amount } },
    { $inc: { walletBalance: -amount } },
    { returnDocument: 'after', session }
  );
  if (!user) {
    throw new AppError('Insufficient wallet balance', 400);
  }
  return user;
}

module.exports = { credit, debit };
