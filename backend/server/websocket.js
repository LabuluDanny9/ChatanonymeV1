/**
 * WebSocket (Socket.IO) - Notifications temps réel
 * Événements: nouveau message, message lu, conversation fermée.
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./config');
const User = require('./models/User');
const Admin = require('./models/Admin');

function getIo(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: config.cors.origin },
    path: '/ws',
  });

  // Middleware d'auth Socket
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Token manquant'));
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      if (decoded.type === 'anonymous' || decoded.type === 'user') {
        const user = await User.findById(decoded.userId);
        if (!user || user.status !== 'active') return next(new Error('Utilisateur invalide'));
        socket.user = { id: user.id, type: 'anonymous' };
      } else if (decoded.type === 'admin') {
        const admin = await Admin.findById(decoded.adminId);
        if (!admin) return next(new Error('Admin invalide'));
        socket.admin = { id: admin.id, type: 'admin' };
      } else {
        return next(new Error('Type inconnu'));
      }
      next();
    } catch (err) {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.user) {
      socket.join(`user:${socket.user.id}`);
      // Typing utilisateur → admin
      socket.on('typing:user', () => io.to('admin').emit('typing:user', { userId: socket.user.id }));
      socket.on('typing:user:stop', () => io.to('admin').emit('typing:user:stop', { userId: socket.user.id }));
    }
    if (socket.admin) {
      socket.join('admin');
    }

    socket.on('disconnect', () => {});
  });

  return io;
}

module.exports = { getIo };
