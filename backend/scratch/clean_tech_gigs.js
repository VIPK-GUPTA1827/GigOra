require('dotenv').config();
const mongoose = require('mongoose');
const Gig = require('../models/Gig');
const User = require('../models/User');

async function cleanGigs() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Remove plumbing & test tasks
  await Gig.deleteMany({ 
    category: { $in: ['Plumbing', 'plumbing'] }
  });
  await Gig.deleteMany({ 
    title: { $in: ['Final Integration Task', 'React Developer for Proximity API', 'Full Stack React Project', 'Home Pipe Leak Repair'] }
  });

  const clientUser = await User.findOne({ role: 'client' });
  if (clientUser) {
    await Gig.create([
      {
        title: 'Full Stack React & Tailwind Web App',
        description: 'Need an experienced frontend developer to build responsive dashboard components with Tailwind CSS and clean API integration.',
        category: 'Web Development',
        budget: 15000,
        client: clientUser._id,
        status: 'open',
        address: 'Mumbai, Maharashtra',
        location: { type: 'Point', coordinates: [72.8777, 19.0760] }
      },
      {
        title: 'Python Web Scraper & Data Pipeline',
        description: 'Develop an automated script using Python/BeautifulSoup to extract market listings daily and store structured JSON.',
        category: 'AI & Data',
        budget: 8000,
        client: clientUser._id,
        status: 'open',
        address: 'Bandra, Mumbai',
        location: { type: 'Point', coordinates: [72.8400, 19.0550] }
      },
      {
        title: 'UI/UX Redesign for SaaS Platform',
        description: 'Design 5 core web app screens in Figma: User onboarding, analytics dashboard, settings, and billing views.',
        category: 'Design',
        budget: 12000,
        client: clientUser._id,
        status: 'open',
        address: 'Andheri, Mumbai',
        location: { type: 'Point', coordinates: [72.8300, 19.1100] }
      }
    ]);
  }

  const updatedGigs = await Gig.find({});
  console.log('UPDATED GIGS COUNT:', updatedGigs.length);
  updatedGigs.forEach(g => console.log('✓', g.title, '|', g.category, '| ₹' + g.budget));
  process.exit(0);
}

cleanGigs().catch(err => {
  console.error(err);
  process.exit(1);
});
