/**
 * Vercel Serverless - Backend API
 * Toutes les requêtes /api/* sont routées vers Express via le rewrite vercel.json.
 * Note: WebSocket (Socket.IO) ne fonctionne pas en serverless.
 */

const app = require('../backend/server/app');

// Express sans io (serverless) - les contrôleurs gèrent io null
app.set('io', null);

module.exports = (req, res) => {
  app(req, res);
};
