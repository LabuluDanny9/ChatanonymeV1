/**
 * Vercel Serverless - Backend API
 * Toutes les requêtes /api/* sont routées vers Express.
 * Note: WebSocket (Socket.IO) ne fonctionne pas en serverless.
 */

const app = require('../backend/server/app');

// Express sans io (serverless) - les contrôleurs gèrent io null
app.set('io', null);

module.exports = (req, res) => {
  app(req, res);
};
