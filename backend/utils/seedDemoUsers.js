// utils/seedDemoUsers.js -> npm run seed:demo
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'DemoGigora#2026';

const DEMO_USERS = [
  {
    name: 'Demo Client',
    username: 'demo_client',
    email: 'demo.client@example.com',
    role: 'client'
  },
  {
    name: 'Demo Freelancer',
    username: 'demo_freelancer',
    email: 'demo.freelancer@example.com',
    role: 'freelancer'
  }
];

async function seedDemoUsers() {
  for (const d of DEMO_USERS) {
    let user = await User.findOne({ email: d.email });
    if (!user) {
      await User.create({
        ...d,
        password: DEMO_PASSWORD,
        isEmailVerified: true
      });
      console.log('Created:', d.email);
    } else {
      user.isEmailVerified = true;
      await user.save();
      console.log('Already exists:', d.email);
    }
  }
}

if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(seedDemoUsers)
    .then(() => mongoose.disconnect())
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}

module.exports = { seedDemoUsers, DEMO_PASSWORD };
