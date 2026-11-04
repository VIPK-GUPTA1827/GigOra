const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { corsOptions } = require('./config/cors');
const sanitizeInput = require('./middleware/sanitize');
const { notFound, errorHandler } = require('./middleware/errorHandler');

mongoose.set('strictQuery', true);

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(sanitizeInput);

const api = express.Router();
api.use('/auth', require('./routes/auth'));
api.use('/gigs', require('./routes/gigs'));
api.use('/proposals', require('./routes/proposals'));
api.use('/reviews', require('./routes/reviews'));
api.use('/messages', require('./routes/messages'));
api.use('/notifications', require('./routes/notifications'));
api.use('/wallet', require('./routes/wallet'));
api.use('/admin', require('./routes/admin'));
api.use('/bookings', require('./routes/bookings'));
api.use('/disputes', require('./routes/disputes'));
api.use('/analytics', require('./routes/analytics'));
api.use('/freelancer', require('./routes/freelancer'));
api.use('/upload', require('./routes/upload'));

api.get('/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({
    status: dbUp ? 'ok' : 'degraded',
    db: dbUp ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

app.use('/api/v1', api); // New versioned API root
app.use('/api', api);    // Backward compatibility for existing web frontend

app.use('/uploads', express.static(
  path.join(__dirname, 'uploads'),
  { setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff') }
));

app.get('/', (req, res) => res.json({ status: 'ok' }));

app.use('/api', notFound);
app.use(errorHandler);

module.exports = app;
