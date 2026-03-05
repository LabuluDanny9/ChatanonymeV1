/**
 * SILENCEHUB - Application Express
 * API REST sécurisée, CORS, rate limiting, sanitization.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const { apiLimiter } = require('./middleware/rateLimiter');
const { sanitizeBody } = require('./middleware/sanitize');
const errorHandler = require('./middleware/errorHandler');

const path = require('path');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const topicRoutes = require('./routes/topicRoutes');
const broadcastRoutes = require('./routes/broadcastRoutes');
const adminRoutes = require('./routes/adminRoutes');
const configController = require('./controllers/configController');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Trust proxy (requis quand le frontend appelle via proxy - X-Forwarded-For)
app.set('trust proxy', 1);

// Sécurité
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(apiLimiter);

// Body parsing — 15MB pour messages vocaux et pièces jointes (base64)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(sanitizeBody);

// Fichiers uploadés (statique)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'silencehub' }));

// Accès direct à la racine — redirection vers le frontend
app.get('/', (req, res) =>
  res.status(200).json({
    service: 'SilenceHub API',
    message: 'Utilisez http://localhost:3000 pour accéder à l\'application.',
    docs: '/health pour le statut du serveur',
  })
);

// Config publique
app.get('/api/config', configController.getConfig);

// API
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/admin', adminRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Non trouvé' }));

// Erreurs
app.use(errorHandler);

module.exports = app;
