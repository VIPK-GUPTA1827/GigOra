const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const User = require('./models/User');
const { allowedOrigins } = require('./config/cors');

const isId = (v) => typeof v === 'string' && mongoose.Types.ObjectId.isValid(v);

function setupSocket(server) {
  const io = socketio(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const cookieToken = (socket.handshake.headers.cookie || '')
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('token='))
        ?.split('=')[1];

      const token = socket.handshake.auth?.token || cookieToken;
      if (!token) return next(new Error('Auth required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id role isSuspended tokenVersion');
      if (!user || user.isSuspended) {
        return next(new Error('Not allowed'));
      }
      if ((decoded.v || 0) !== (user.tokenVersion || 0)) {
        return next(new Error('Session ended'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    socket.join(userId);

    // Simple limit: 20 events / 10 sec per socket
    let count = 0;
    const timer = setInterval(() => { count = 0; }, 10000);
    const allowed = () => ++count <= 20;

    socket.on('send_message', async (data, ack) => {
      const reply = typeof ack === 'function' ? ack : () => {};
      try {
        if (!allowed()) {
          return reply({ ok: false, error: 'Too fast' });
        }

        const recipient = data?.recipient;
        const text = typeof data?.text === 'string' ? data.text.trim() : '';

        if (!isId(recipient) || recipient === userId) {
          return reply({ ok: false, error: 'Bad recipient' });
        }

        if (!text || text.length > 5000) {
          return reply({ ok: false, error: 'Bad text' });
        }

        const exists = await User.exists({
          _id: recipient,
          isSuspended: { $ne: true }
        });
        if (!exists) return reply({ ok: false, error: 'No user' });

        const message = await Message.create({
          sender: socket.user._id,
          recipient,
          text
        });

        io.to(recipient).emit('receive_message', message);
        io.to(userId).emit('message_sent', message);
        reply({ ok: true, id: message._id });
      } catch (err) {
        console.error('send_message error:', err.message);
        reply({ ok: false, error: 'Server error' });
      }
    });

    socket.on('typing', (data) => {
      if (allowed() && isId(data?.recipient)) {
        io.to(data.recipient).emit('typing', { sender: userId });
      }
    });

    socket.on('stop_typing', (data) => {
      if (allowed() && isId(data?.recipient)) {
        io.to(data.recipient).emit('stop_typing', { sender: userId });
      }
    });

    socket.on('mark_read', async (data) => {
      try {
        if (!allowed() || !isId(data?.sender)) return;
        await Message.updateMany(
          { sender: data.sender, recipient: userId, read: false },
          { $set: { read: true } }
        );
        io.to(data.sender).emit('messages_read', { reader: userId });
      } catch (err) {
        console.error('mark_read error:', err.message);
      }
    });

    socket.on('disconnect', () => clearInterval(timer));
  });

  return io;
}

module.exports = { setupSocket };
