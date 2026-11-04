# GigOra Engineering Standards & Agent Rules

This file governs all development, refactoring, and AI operations on the **GigOra** repository. It synthesizes four core engineering disciplines:
1. **Ponytail** (Lazy Senior Dev Mode — minimal code, zero bloat, root-cause solutions)
2. **Cloudflare Security Audit** (Trust boundaries, input sanitization, token security)
3. **Strix** (OWASP Top-10 defense, IDOR/BOLA prevention, escrow state security)
4. **ECC** (Backend architecture, Mongoose schema hygiene, clean REST conventions)

---

## 1. Core Philosophy: Lazy Senior Dev Mode (Ponytail)

> The best code is the code never written. Solve the whole problem with the least new code.

- **Check before writing:** Read the code it touches. List every caller, test, config, and export. Check what could break for users.
- **No unnecessary bloat:** Do not add npm packages for things that can be done with native Node.js / JavaScript.
- **Match existing patterns:** Keep the structure the codebase already has (`controllers/`, `routes/`, `models/`, `middleware/`).
- **Fix root causes:** Before editing, grep every caller. Fix the root cause once in shared logic, not with patches at call sites.
- **Concise & Readable:** The shortest working, readable diff wins. Comment only the *why* that code cannot show.
- **Always declare limits:** Every intentional shortcut gets a comment: `// shortcut: <the limit>, <when to upgrade>`.

---

## 2. Security & Trust Boundaries (Cloudflare Security Audit)

- **Never Trust Client Input:** Treat all incoming data (`req.body`, `req.params`, `req.query`, `req.headers`) as untrusted.
- **NoSQL Injection Defense:** All queries must strip or escape MongoDB operators (`$` and `.`). Never pass raw `req.body` directly into Mongoose filters like `User.findOne(req.body)`.
- **JWT & Session Security:**
  - Verify tokens on every protected route via `auth` middleware.
  - Never store plain text passwords; always hash with bcrypt (minimum cost factor 10).
  - Store tokens in `httpOnly`, `sameSite: 'lax'`, `secure: process.env.NODE_ENV === 'production'` cookies or strictly authenticated headers.
- **Environment & Secrets Hygiene:**
  - Never commit `.env` files or API secrets (`JWT_SECRET`, database connection strings, OAuth credentials).
  - Fall back safely to clear error messages if required environment variables are missing on startup.
- **Safe Error Responses:**
  - Centralize all error handling in a dedicated Express error middleware.
  - In production, never return internal database error details, stack traces, or server paths to the client.

---

## 3. Exploit & Fraud Defense (Strix / OWASP Top-10)

- **IDOR / BOLA Prevention (Broken Object-Level Authorization):**
  - Never trust an `id` in `req.params` alone. Always verify that `req.user.id` is the actual owner or authorized participant (e.g., verifying a freelancer owns the proposal or a client owns the gig before updating).
- **Role-Based Access Control (RBAC):**
  - Strictly enforce roles (`client` vs `freelancer` vs `admin`). Clients cannot apply to gigs; freelancers cannot create client escrows.
- **Escrow & Financial State Machine:**
  - State transitions must be strictly enforced: `pending` → `funded` → `in_progress` → `submitted` → `released` (or `disputed` / `refunded`).
  - Prevent balance manipulation and race conditions by using atomic operations (`$inc`, findOneAndUpdate with state check) or Mongoose session transactions.
- **Rate Limiting & Brute-Force Defense:**
  - Protect sensitive endpoints (`/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`) with strict rate limiters.

---

## 4. Backend & Database Architecture (ECC)

- **Mongoose Schema Hygiene:**
  - All schemas must define explicit types, `required` constraints, `enum` limits for status fields, and sensible defaults.
  - Add indexes for fields frequently queried (`gig`, `freelancer`, `client`, `status`, `createdAt`).
- **Standardized API Responses:**
  - Success responses: `{ success: true, data: { ... }, message?: string }`
  - Error responses: `{ success: false, message: "User friendly error message" }`
- **Graceful Async Handling:**
  - Use async/await with clean try-catch blocks or an async handler wrapper so unhandled promise rejections never crash the process.

---

## 5. Web Platform & Tooling Standards (Active Plugins)

- **Modern Web Guidance (Google Chrome & Microsoft Edge):**
  - Always prefer modern native Web APIs over bloated npm packages (e.g., native Popover/Dialog API over heavy modal libraries, native `scheduler.yield` for long tasks, modern CSS container queries, `:has()`, `:user-invalid`).
- **Chrome DevTools & Automation:**
  - Automated debugging and network validation through Chrome DevTools and Puppeteer protocols.
- **Data Agent Kit (Cloud & DB Best Practices):**
  - Adhere to query indexing best practices, lean projection (`select()`), and anti-N+1 query patterns.
