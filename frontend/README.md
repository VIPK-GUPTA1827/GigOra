# 🎨 GigOra Frontend

Modern, responsive web application for the GigOra marketplace built with React 19, Vite, and Tailwind CSS.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
In development, `VITE_API_URL` can be left blank because Vite's dev server automatically proxies `/api` and `/socket.io` to `http://localhost:5000`.

In production (e.g. Vercel), set:
```env
VITE_API_URL=https://gigora-backend.onrender.com
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## ⚡ Performance & UX Highlights

- **Route-Level Code Splitting**: All major pages split with `React.lazy` and `Suspense`, keeping main entry bundle under 285 KB.
- **Resilient API Layer**: Automatic 401 token refresh queue with race condition prevention and single-flight retry.
- **Skeleton Pulse States**: Shimmer skeletons prevent layout shift (CLS) during API fetching.
- **Accessible Error Boundaries**: Graceful crash recovery with contextual diagnostics and recovery buttons.
- **Toast Notifications**: Lightweight, zero-dependency contextual toast feedback (`useToast()`).
