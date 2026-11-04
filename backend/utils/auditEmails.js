// utils/auditEmails.js (kuch delete nahi karta)
// node utils/auditEmails.js -> list dikhao
// node utils/auditEmails.js --reset a@x.com -> sirf inhe reset
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { TYPO_DOMAINS, DISPOSABLE_DOMAINS } = require('./emailCheck');

function reasons(email) {
  const [local, domain] = email.split('@');
  const r = [];
  if (TYPO_DOMAINS[domain]) r.push('typo domain');
  if (DISPOSABLE_DOMAINS.has(domain)) r.push('disposable');
  if (/^\d+$/.test(local)) r.push('sirf numbers');
  if (local.length <= 3) r.push('bahut chhota');
  return r;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const [flag, ...emails] = process.argv.slice(2);

  if (flag === '--reset') {
    const r = await User.updateMany(
      { email: { $in: emails }, role: { $ne: 'admin' } },
      { $set: { isEmailVerified: false }, $unset: { emailVerificationToken: 1 } }
    );
    console.log(`${r.modifiedCount} user(s) unverified kiye`);
  } else {
    // sirf password wale users (Google wale chhod do)
    const users = await User.find({
      isEmailVerified: true,
      googleId: null,
      role: { $ne: 'admin' }
    }).select('email');

    users.forEach((u) => {
      const why = reasons(u.email);
      if (why.length) console.log(u.email, why.join(', '));
    });
  }

  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}

module.exports = { reasons };
