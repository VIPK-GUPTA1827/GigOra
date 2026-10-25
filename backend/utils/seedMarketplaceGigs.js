const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Gig = require('../models/Gig');
const User = require('../models/User');

const DEMO_GIGS = [
  {
    title: 'Full-Stack Next.js 14 E-Commerce Portal',
    category: 'Web Development',
    budget: 45000,
    experienceLevel: 'Expert',
    duration: '3-4 weeks',
    locationType: 'remote',
    address: 'Bengaluru, Karnataka (Remote)',
    location: { type: 'Point', coordinates: [77.5946, 12.9716] },
    skillsRequired: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Razorpay API'],
    description: 'We are launching an artisanal D2C merchandise brand and need a high-performance, responsive e-commerce web application. Deliverables include server-side rendered catalog pages, filterable search, cart/checkout flow, Razorpay payment gateway integration, and order management dashboard.',
    status: 'open',
    isDemo: true,
    milestones: [
      {
        title: 'Architecture & Product Catalog SSR pages',
        budget: 15000,
        amount: 15000,
        description: 'Next.js project setup, responsive navigation, SSR product grid with category filters.',
        status: 'pending',
        checklist: [
          { text: 'Set up Next.js 14 with App Router and Tailwind', isCompleted: false },
          { text: 'Build product listing with responsive grid and image optimization', isCompleted: false },
          { text: 'Implement search and category filters', isCompleted: false }
        ]
      },
      {
        title: 'Cart, Checkout flow & Payment gateway integration',
        budget: 20000,
        amount: 20000,
        description: 'State-managed cart drawer, address form, and Razorpay checkout sandbox integration.',
        status: 'pending',
        checklist: [
          { text: 'Build persistent shopping cart with quantity controls', isCompleted: false },
          { text: 'Integrate Razorpay webhook and checkout order verification', isCompleted: false }
        ]
      },
      {
        title: 'Order dashboard & production QA deployment',
        budget: 10000,
        amount: 10000,
        description: 'User order history, receipt downloads, and Vercel production deployment.',
        status: 'pending',
        checklist: [
          { text: 'User order tracking page with status badges', isCompleted: false },
          { text: 'Lighthouse audit (Performance > 90)', isCompleted: false }
        ]
      }
    ]
  },
  {
    title: 'Cross-Platform React Native Fitness & Nutrition App',
    category: 'Mobile App Development',
    budget: 65000,
    experienceLevel: 'Expert',
    duration: '4-6 weeks',
    locationType: 'hybrid',
    address: 'Mumbai, Maharashtra (Hybrid)',
    location: { type: 'Point', coordinates: [72.8777, 19.0760] },
    skillsRequired: ['React Native', 'Expo', 'Redux Toolkit', 'Node.js', 'Firebase'],
    description: 'Seeking a talented mobile engineer to build a cross-platform mobile app for iOS and Android. Features include workout logging, calorie & macro tracking, real-time sync with backend REST APIs, and push notifications for daily reminders.',
    status: 'open',
    isDemo: true,
    milestones: [
      {
        title: 'Authentication & UI Design Implementation',
        budget: 20000,
        amount: 20000,
        description: 'Complete onboarding screens, biometric/JWT auth, and tab navigation shell.',
        status: 'pending',
        checklist: [
          { text: 'Figma to React Native component conversion', isCompleted: false },
          { text: 'Secure token storage with AsyncStorage/Keychain', isCompleted: false }
        ]
      },
      {
        title: 'Workout & Diet Tracking Modules with Offline Cache',
        budget: 25000,
        amount: 25000,
        description: 'Interactive workout logger, timer, food search database, and SQLite offline cache.',
        status: 'pending',
        checklist: [
          { text: 'Workout log with set/rep counter and rest timer', isCompleted: false },
          { text: 'Offline sync engine with background synchronization', isCompleted: false }
        ]
      },
      {
        title: 'Push Notifications, App Store submission build & E2E Testing',
        budget: 20000,
        amount: 20000,
        description: 'Scheduled reminders via Expo Notifications and production test builds.',
        status: 'pending',
        checklist: [
          { text: 'Push notification engine for hydration and workout alerts', isCompleted: false },
          { text: 'EAS build generation for Android APK & iOS TestFlight', isCompleted: false }
        ]
      }
    ]
  },
  {
    title: 'Fintech Analytics Dashboard & Design System (Figma)',
    category: 'UI/UX Design',
    budget: 32000,
    experienceLevel: 'Intermediate',
    duration: '2-3 weeks',
    locationType: 'remote',
    address: 'Mumbai, Maharashtra (Remote)',
    location: { type: 'Point', coordinates: [72.8777, 19.0760] },
    skillsRequired: ['Figma', 'UI/UX Design', 'Design Systems', 'Wireframing', 'Prototyping'],
    description: 'Need an experienced UI/UX designer to craft an ultra-clean, modern web analytics dashboard for financial portfolios. Project covers user persona research, dark/light theme tokens, 12 core dashboard views, interactive Figma prototype, and component library handoff for React developers.',
    status: 'open',
    isDemo: true,
    milestones: [
      {
        title: 'Information architecture & low-fidelity wireframes',
        budget: 10000,
        amount: 10000,
        description: 'User journeys, dashboard layout grids, and core widget wireframes.',
        status: 'pending',
        checklist: [
          { text: 'User persona definition and workflow diagrams', isCompleted: false },
          { text: 'Low-fidelity layout options for desktop and tablet', isCompleted: false }
        ]
      },
      {
        title: 'High-fidelity Figma screens with reusable design tokens',
        budget: 14000,
        amount: 14000,
        description: 'Color palettes, typography hierarchy, chart styles, and 12 dashboard views.',
        status: 'pending',
        checklist: [
          { text: 'Design token library (typography, spacing, shadows)', isCompleted: false },
          { text: 'Dark and light theme variants for analytics cards', isCompleted: false }
        ]
      },
      {
        title: 'Interactive prototype & developer handoff specs',
        budget: 8000,
        amount: 8000,
        description: 'Clickable prototype with micro-interactions and exported asset kit.',
        status: 'pending',
        checklist: [
          { text: 'Clickable prototype linking all main flows', isCompleted: false },
          { text: 'Developer handoff documentation with component variants', isCompleted: false }
        ]
      }
    ]
  },
  {
    title: 'Customer Churn Prediction Engine & LLM Support Bot',
    category: 'Data Science & AI',
    budget: 55000,
    experienceLevel: 'Advanced',
    duration: '3-4 weeks',
    locationType: 'remote',
    address: 'Hyderabad, Telangana (Remote)',
    location: { type: 'Point', coordinates: [78.4867, 17.3850] },
    skillsRequired: ['Python', 'scikit-learn', 'FastAPI', 'Pandas', 'OpenAI/Gemini API'],
    description: 'Build an end-to-end data pipeline that ingests customer subscription logs, trains an XGBoost classifier for churn risk, and deploys a FastAPI inference endpoint. In addition, connect an automated FAQ assistant using LLM embeddings for customer support escalation.',
    status: 'open',
    isDemo: true,
    milestones: [
      {
        title: 'EDA, Feature Engineering & ML Model Training',
        budget: 20000,
        amount: 20000,
        description: 'Data cleaning pipeline, correlation analysis, and model cross-validation.',
        status: 'pending',
        checklist: [
          { text: 'Feature extraction from customer event timestamps', isCompleted: false },
          { text: 'XGBoost hyperparameter tuning with ROC-AUC > 0.88', isCompleted: false }
        ]
      },
      {
        title: 'FastAPI microservice packaging with Docker',
        budget: 20000,
        amount: 20000,
        description: 'Production inference API with input validation and Docker containerization.',
        status: 'pending',
        checklist: [
          { text: 'FastAPI REST endpoints for single and batch predictions', isCompleted: false },
          { text: 'Dockerfile creation with multi-stage build', isCompleted: false }
        ]
      },
      {
        title: 'LLM FAQ integration & performance documentation',
        budget: 15000,
        amount: 15000,
        description: 'Retrieval augmented FAQ engine and comprehensive model card docs.',
        status: 'pending',
        checklist: [
          { text: 'Vector index setup with similarity thresholding', isCompleted: false },
          { text: 'Model evaluation report and Swagger API documentation', isCompleted: false }
        ]
      }
    ]
  },
  {
    title: 'High-Throughput Node.js Microservices & Redis Caching',
    category: 'Backend & APIs',
    budget: 48000,
    experienceLevel: 'Expert',
    duration: '3 weeks',
    locationType: 'remote',
    address: 'Pune, Maharashtra (Remote)',
    location: { type: 'Point', coordinates: [73.8567, 18.5204] },
    skillsRequired: ['Node.js', 'Express', 'MongoDB', 'Redis', 'JWT', 'REST API'],
    description: 'We require a senior backend engineer to architect a modular RESTful microservice handling high-volume order transactions. Scope includes multi-tenant JWT auth, rate limiting, distributed Redis caching for catalog reads, and database indexing for sub-50ms latency.',
    status: 'open',
    isDemo: true,
    milestones: [
      {
        title: 'Database schema optimization & core CRUD controllers',
        budget: 16000,
        amount: 16000,
        description: 'Mongoose schema design, compound indices, and transactional controllers.',
        status: 'pending',
        checklist: [
          { text: 'Implement MongoDB compound indices on active queries', isCompleted: false },
          { text: 'Write robust input sanitization and error handling middleware', isCompleted: false }
        ]
      },
      {
        title: 'Redis caching layer & token rate limiting',
        budget: 18000,
        amount: 18000,
        description: 'Distributed cache invalidation strategy and sliding window rate limiter.',
        status: 'pending',
        checklist: [
          { text: 'Cache-aside implementation with automatic TTL expiration', isCompleted: false },
          { text: 'Redis-backed token bucket rate limiter per API key', isCompleted: false }
        ]
      },
      {
        title: 'Test suite & OpenAPI/Swagger documentation',
        budget: 14000,
        amount: 14000,
        description: 'Jest automated unit/integration tests and interactive Swagger docs.',
        status: 'pending',
        checklist: [
          { text: 'Jest test coverage > 85% across all route controllers', isCompleted: false },
          { text: 'Complete Swagger/OpenAPI documentation schema', isCompleted: false }
        ]
      }
    ]
  },
  {
    title: 'AWS EKS Kubernetes Cluster Setup & GitHub Actions CI/CD',
    category: 'DevOps & Cloud',
    budget: 50000,
    experienceLevel: 'Advanced',
    duration: '2-3 weeks',
    locationType: 'remote',
    address: 'Remote (India)',
    location: { type: 'Point', coordinates: [72.8777, 19.0760] },
    skillsRequired: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'GitHub Actions'],
    description: 'Set up a production-ready AWS environment using Terraform for infrastructure as code. Requirements include an Elastic Kubernetes Service (EKS) cluster, VPC with public/private subnets, automated zero-downtime rolling deployments via GitHub Actions, and Prometheus/Grafana monitoring alerts.',
    status: 'open',
    isDemo: true,
    milestones: [
      {
        title: 'Terraform IaC provisioning',
        budget: 18000,
        amount: 18000,
        description: 'VPC, multi-AZ subnets, NAT gateways, IAM roles, and security group rules.',
        status: 'pending',
        checklist: [
          { text: 'Modular Terraform configuration with remote S3 state backend', isCompleted: false },
          { text: 'Secure IAM roles with least-privilege policies', isCompleted: false }
        ]
      },
      {
        title: 'EKS cluster manifests & Ingress Controller',
        budget: 18000,
        amount: 18000,
        description: 'Kubernetes cluster deployment, NGINX ingress, and Cert-Manager SSL.',
        status: 'pending',
        checklist: [
          { text: 'Deploy managed node groups with autoscaling policies', isCompleted: false },
          { text: 'Configure Let’s Encrypt auto-renewing SSL certificates', isCompleted: false }
        ]
      },
      {
        title: 'GitHub Actions CI/CD & Grafana monitoring',
        budget: 14000,
        amount: 14000,
        description: 'Automated container build/push pipeline and Prometheus cluster metrics.',
        status: 'pending',
        checklist: [
          { text: 'CI/CD workflow with automatic rollback on healthcheck failure', isCompleted: false },
          { text: 'Grafana dashboard for CPU, memory, and HTTP response metrics', isCompleted: false }
        ]
      }
    ]
  },
  {
    title: 'Technical API Documentation & Developer Onboarding Guides',
    category: 'Content & Writing',
    budget: 18000,
    experienceLevel: 'Intermediate',
    duration: '1-2 weeks',
    locationType: 'remote',
    address: 'Remote (India)',
    location: { type: 'Point', coordinates: [72.8777, 19.0760] },
    skillsRequired: ['Technical Writing', 'Markdown', 'API Documentation', 'Postman', 'SDK Guides'],
    description: 'Looking for a technical writer who understands software development to create crystal-clear documentation for our B2B logistics API. Deliverables include a getting-started guide, authentication walkthrough, code samples in cURL/Node.js/Python, and error code troubleshooting tables.',
    status: 'open',
    isDemo: true,
    milestones: [
      {
        title: 'API overview & Quickstart Guide',
        budget: 8000,
        amount: 8000,
        description: 'High-level architecture, authentication guide, and interactive Postman collection.',
        status: 'pending',
        checklist: [
          { text: 'Write Getting Started tutorial with sample API credentials', isCompleted: false },
          { text: 'Export verified Postman collection with pre-request scripts', isCompleted: false }
        ]
      },
      {
        title: 'Endpoint reference & error handling guide',
        budget: 10000,
        amount: 10000,
        description: 'Granular documentation for 15 endpoints with request/response payloads.',
        status: 'pending',
        checklist: [
          { text: 'Complete parameter descriptions and types in Markdown', isCompleted: false },
          { text: 'Error catalog explaining HTTP status codes and resolution steps', isCompleted: false }
        ]
      }
    ]
  },
  {
    title: 'Modern Tech Brand Identity, Logo & Social Collateral Kit',
    category: 'Graphic Design',
    budget: 22000,
    experienceLevel: 'Intermediate',
    duration: '1-2 weeks',
    locationType: 'remote',
    address: 'Delhi NCR (Remote)',
    location: { type: 'Point', coordinates: [77.1025, 28.7041] },
    skillsRequired: ['Adobe Illustrator', 'Photoshop', 'Brand Identity', 'Vector Graphics', 'Typography'],
    description: 'Create a distinctive, futuristic brand identity for an AI-powered SaaS product. Includes primary and secondary vector logos, color palette, typography guidelines, presentation deck template, and social media banner templates for LinkedIn, Twitter, and YouTube.',
    status: 'open',
    isDemo: true,
    milestones: [
      {
        title: 'Concept proposals & moodboards',
        budget: 8000,
        amount: 8000,
        description: '3 distinct creative directions with typography and color exploration.',
        status: 'pending',
        checklist: [
          { text: 'Deliver 3 vector logo concepts with rationale', isCompleted: false },
          { text: 'Moodboard with real-world application mockups', isCompleted: false }
        ]
      },
      {
        title: 'Vector logo suite & brand guidelines PDF',
        budget: 8000,
        amount: 8000,
        description: 'Refined master logo in SVG/AI/PNG formats and brand guidelines book.',
        status: 'pending',
        checklist: [
          { text: 'Light and dark mode vector logos in high-res formats', isCompleted: false },
          { text: '16-page brand guidelines PDF covering usage and typography', isCompleted: false }
        ]
      },
      {
        title: 'Social media collateral & pitch deck templates',
        budget: 6000,
        amount: 6000,
        description: 'Banners for LinkedIn, X/Twitter, and 10 master slides in Figma/Canva.',
        status: 'pending',
        checklist: [
          { text: 'Custom banners and avatar badges for social platforms', isCompleted: false },
          { text: 'Clean pitch deck template with editable charts and icons', isCompleted: false }
        ]
      }
    ]
  },
  {
    title: 'React & Tailwind Real-Time Analytics Dashboard',
    category: 'Web Development',
    budget: 38000,
    experienceLevel: 'Intermediate',
    duration: '2-3 weeks',
    locationType: 'remote',
    address: 'Mumbai, Maharashtra (Remote)',
    location: { type: 'Point', coordinates: [72.8777, 19.0760] },
    skillsRequired: ['React', 'Tailwind CSS', 'Recharts', 'Lucide Icons', 'REST API'],
    description: 'Build an interactive, modular web dashboard for monitoring live fleet tracking metrics. Features include responsive KPI summary cards, interactive charts using Recharts, live data polling, export-to-CSV functionality, and clean mobile responsiveness.',
    status: 'open',
    isDemo: true,
    milestones: [
      {
        title: 'Layout shell & responsive KPI metric cards',
        budget: 14000,
        amount: 14000,
        description: 'Sticky header, collapsible sidebar, and responsive statistics cards.',
        status: 'pending',
        checklist: [
          { text: 'Build modular metric cards with percentage trends', isCompleted: false },
          { text: 'Ensure seamless responsiveness on mobile and tablet', isCompleted: false }
        ]
      },
      {
        title: 'Interactive Recharts visualization & date range filters',
        budget: 14000,
        amount: 14000,
        description: 'Area, bar, and donut charts with custom tooltip formatting.',
        status: 'pending',
        checklist: [
          { text: 'Area chart displaying monthly performance trends', isCompleted: false },
          { text: 'Date range picker with live chart updates', isCompleted: false }
        ]
      },
      {
        title: 'CSV export, loading skeletons & error states',
        budget: 10000,
        amount: 10000,
        description: 'Data export utility, graceful empty states, and skeleton loaders.',
        status: 'pending',
        checklist: [
          { text: 'One-click CSV data export for current view', isCompleted: false },
          { text: 'Clean skeleton shimmer loaders during data fetch', isCompleted: false }
        ]
      }
    ]
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is missing from environment');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // 1. Delete junk test gigs (timestamp suffixes or known test titles)
    const deleteRes = await Gig.deleteMany({
      $or: [
        { title: { $regex: /\d{5,}/ } },
        { title: { $regex: /(Security Audit|Project to Protect|Confidential Draft|Automated Test|Automated E-Commerce|NextGen Web|Fullstack Microservices Development)/i } },
        { isDemo: true }
      ]
    });
    console.log(`Cleaned up ${deleteRes.deletedCount} junk/previous test gigs.`);

    // 2. Find or create a professional demo client
    let client = await User.findOne({ email: 'client@gigora.in' });
    if (!client) {
      client = await User.create({
        name: 'Aura Systems India',
        username: 'aurasystems',
        email: 'client@gigora.in',
        password: '$2a$10$e7Zc5Xj1YdK3.P9yVbQ3b.2h1k4l7m0n9p8q7r6s5t4u3v2w1x0yZ',
        role: 'client',
        companyName: 'Aura Cloud Technologies Pvt Ltd',
        industry: 'Software & Cloud Services',
        location: { city: 'Mumbai', state: 'Maharashtra' },
        isProfileComplete: true
      });
      console.log('Created official demo client user: Aura Systems India');
    }

    // 3. Insert realistic demo gigs
    const gigsToInsert = DEMO_GIGS.map((g) => ({
      ...g,
      client: client._id
    }));

    const inserted = await Gig.insertMany(gigsToInsert);
    console.log(`Successfully seeded ${inserted.length} realistic demo gigs.`);

    const totalOpen = await Gig.countDocuments({ status: 'open' });
    console.log(`Total active open gigs in marketplace now: ${totalOpen}`);

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
