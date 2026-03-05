/**
 * ChatAnonyme - Point d'entrée serveur
 * Démarre HTTP, WebSocket et initialise l'admin si besoin.
 */

require('dotenv').config();
const http = require('http');
const config = require('./config');
const app = require('./app');
const { getIo } = require('./websocket');
const seedAdmin = require('./scripts/seedAdmin');
const seedTopicsIfNeeded = require('./scripts/seedTopicsSupabase');
const { pool, useJson } = require('./config/database');

const server = http.createServer(app);
const io = getIo(server);

// Exposer io pour que les contrôleurs puissent émettre des événements
app.set('io', io);

const PORT = config.port;

async function start() {
  try {
    await seedAdmin();
  } catch (e) {
    console.warn('Seed admin:', e.message);
  }
  if (!useJson) {
    try {
      await seedTopicsIfNeeded(pool);
    } catch (e) {
      console.warn('Seed topics:', e.message);
    }
  }
  server.listen(PORT, () => {
    console.log(`ChatAnonyme backend listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Démarrage impossible:', err);
  process.exit(1);
});
