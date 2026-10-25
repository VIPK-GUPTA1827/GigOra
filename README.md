# ⚡ GigOra — Hyperlocal Milestone Freelance Marketplace

[![Live Demo](https://img.shields.io/badge/Live%20Demo-gig--ora.vercel.app-7c3aed?style=for-the-badge&logo=vercel)](https://gig-ora.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20Status-Live%20on%20Render-46E3B7?style=for-the-badge&logo=render)](https://gigora-backend.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](./LICENSE)

> A modern, full-stack MERN freelance platform featuring milestone-based escrow payments, real-time messaging via Socket.io, Google OAuth 2.0 authentication, and AI-powered gig matching.

---

## 🌟 Key Features

- **🔐 Robust Authentication & Security**:
  - Google OAuth 2.0 (Google Identity Services) + JWT-based authentication.
  - Password encryption using `bcryptjs` (12 rounds) with strict validation.
  - Brute force mitigation using `express-rate-limit`.
  - HTTP security headers with `helmet` and secure production CORS policies.

- **💼 Milestone & Escrow Workflow**:
  - Structured milestones with staged payments and funded escrow verification.
  - Interactive dispute resolution system with admin moderation.

- **💬 Real-Time Communications**:
  - Live chat and instant alerts powered by Socket.io and WebSockets.
  - Multi-party status updates for proposals, gig contracts, and milestones.

- **🎯 AI Matching & Search**:
  - Skill-based recommendation engine for freelancers and client job posts.
  - Hyperlocal radius and budget-filtered gig discovery.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, Socket.io Client |
| **Backend** | Node.js, Express.js 5, Socket.io, Google Auth Library |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Cloud (Database) |

---

## 🚀 Live Deployments

- **Frontend Application**: [https://gig-ora.vercel.app](https://gig-ora.vercel.app)
- **Backend API**: [https://gigora-backend.onrender.com](https://gigora-backend.onrender.com)
- **Repository**: [https://github.com/VIPK-GUPTA1827/GigOra](https://github.com/VIPK-GUPTA1827/GigOra)

---

## 💻 Local Setup & Development

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Google OAuth Client ID

### 1. Clone the repository
```bash
git clone https://github.com/VIPK-GUPTA1827/GigOra.git
cd GigOra
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, GOOGLE_CLIENT_ID, etc.
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm run dev
```

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE) — created by **Vipin Gupta**.
