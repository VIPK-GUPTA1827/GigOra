# ⚙️ GigOra Backend API

Production-ready Node.js & Express REST API powering the GigOra freelance marketplace with real-time WebSockets, milestone-based escrow payments, and security hardening.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required variables:
- `MONGO_URI`: MongoDB Atlas or local connection string
- `JWT_SECRET`: Secret key (min. 32 characters) for signing access tokens
- `CLIENT_URL`: URL of the frontend app (e.g. `http://localhost:3000` or production URL)
- `CORS_ORIGINS`: Comma-separated allowed origins for CORS

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Test Suite
```bash
npm test
```
Runs integration and unit test suites with Jest and in-memory MongoDB.

---

## 🏗️ Architecture & Security Highlights

- **JWT Auth & Silent Refresh**: 15-minute access token in HTTP-only cookie, 7-day refresh token rotation with consumed-token reuse detection.
- **Boot Environment Guard**: `config/env.js` validates all required environment variables prior to booting server.
- **NoSQL Injection & Parameter Sanitization**: Recursive NoSQL injection neutralization on all request bodies.
- **Rate Limiting**: Per-route limiters (auth, password reset, gig creation, uploads) with Redis/in-memory sliding window.
- **Escrow Transactions**: Multi-document atomic transactions via MongoDB sessions for financial operations (proposals, milestones, releases).
- **Graceful Shutdown**: Handles SIGTERM and SIGINT with connection draining and 10s watchdog timer for zero-downtime deploys on Render.
