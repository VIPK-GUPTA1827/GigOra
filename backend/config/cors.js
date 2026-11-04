// .env: CORS_ORIGINS=https://myapp.com,https://www.myapp.com
const allowedOrigins = (process.env.CORS_ORIGINS ||
  'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173')
  .split(',').map((o) => o.trim()).filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    // Mobile app / Postman me Origin header nahi hota
    if (!origin || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(null, false); // browser will block unauthorized cross-origin requests
  },
  credentials: true
};

module.exports = { allowedOrigins, corsOptions };
