/**
 * Vercel Serverless - Backend API
 * Toutes les requêtes /api/* sont routées vers Express via le rewrite vercel.json.
 * Note: WebSocket (Socket.IO) ne fonctionne pas en serverless.
 */

const app = require('../backend/server/app');

// Express sans io (serverless) - les contrôleurs gèrent io null
app.set('io', null);

module.exports = (req, res) => {
  try {
    app(req, res);
  } catch (err) {
    console.error('[api] Erreur avant Express:', err?.message, err?.stack);
    res.status(500).json({ error: err?.message || 'Erreur serveur' });
  }
};
