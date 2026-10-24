const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const Message = require('./models/Message');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const io = socketio(server, {
    cors: {
        origin: [clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST']
    }
});

app.set('io', io);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

// Middleware
app.use(cors({
    origin: [clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json()); // Parse JSON requests
app.use(cookieParser()); // Parse Cookies for secure session management

// Routes
const authRoutes = require('./routes/auth');
const gigRoutes = require('./routes/gigs');
const proposalRoutes = require('./routes/proposals');
const reviewRoutes = require('./routes/reviews');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');
const bookingRoutes = require('./routes/bookings');
const disputeRoutes = require('./routes/disputes');
const analyticsRoutes = require('./routes/analytics');
const freelancerRoutes = require('./routes/freelancer');
const uploadRoutes = require('./routes/upload');
const path = require('path');

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/freelancer', freelancerRoutes);
app.use('/api/upload', uploadRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff')
}));

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'GigOra Backend is running successfully.',
        timestamp: new Date()
    });
});

// Auth middleware for sockets: verify JWT before any event
io.use(async (socket, next) => {
    try {
        const token =
            socket.handshake.auth?.token ||
            (socket.handshake.headers.cookie || '')
                .split(';')
                .map(c => c.trim())
                .find(c => c.startsWith('token='))
                ?.split('=')[1];

        if (!token) return next(new Error('Authentication required'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return next(new Error('User not found'));

        socket.user = user;
        next();
    } catch (err) {
        next(new Error('Invalid or expired token'));
    }
});

io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    socket.join(userId); // auto-join own room, no client-supplied id
    console.log(`Socket connected: ${userId}`);

    socket.on('send_message', async (data) => {
        try {
            const { recipient, text } = data;
            if (!recipient || !text || typeof text !== 'string' || text.length > 5000) return;

            const sender = socket.user._id; // NEVER trust client for sender
            const message = await Message.create({ sender, recipient, text });

            io.to(recipient).emit('receive_message', message);
            io.to(userId).emit('message_sent', message);
        } catch (err) {
            console.error('Socket send_message error:', err.message);
        }
    });

    socket.on('typing', (data) => {
        if (data?.recipient) io.to(data.recipient).emit('typing', { sender: userId });
    });

    socket.on('stop_typing', (data) => {
        if (data?.recipient) io.to(data.recipient).emit('stop_typing', { sender: userId });
    });

    socket.on('mark_read', async (data) => {
        try {
            const { sender } = data; // partner
            if (!sender) return;
            await Message.updateMany(
                { sender, recipient: userId, read: false },
                { $set: { read: true } }
            );
            io.to(sender).emit('messages_read', { reader: userId });
        } catch (err) {
            console.error('Socket mark_read error:', err.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', userId);
    });
});

// 404 Handler for undefined API routes
app.use('/api', (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `API endpoint not found: ${req.method} ${req.originalUrl}`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    console.error('Unhandled server error:', err.stack || err.message);
    res.status(err.status || err.statusCode || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : err.message || 'Internal Server Error'
    });
});

// Start listening
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
