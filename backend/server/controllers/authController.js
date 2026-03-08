/**
 * Contrôleur Auth - Inscription, login utilisateur, login admin
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const Admin = require('../models/Admin');

// POST /api/auth/register - Inscription (pseudo, mot de passe, phone?, email?, photo?)
async function register(req, res, next) {
  try {
    const { pseudo, password, phone, email, photo } = req.body || {};
    if (!pseudo || !password) {
      return res.status(400).json({ error: 'Pseudo et mot de passe requis' });
    }
    const existing = await User.findByPseudo(pseudo);
    if (existing) {
      return res.status(400).json({ error: 'Ce pseudo est déjà utilisé' });
    }
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      pseudo: pseudo.trim(),
      passwordHash: hash,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      photo: photo || null,
    });
    const token = jwt.sign(
      { userId: user.id, type: 'user' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    return res.status(201).json({
      token,
      user: { id: user.id, pseudo: user.pseudo, phone: user.phone, email: user.email, photo: user.photo },
    });
  } catch (err) {
    console.error('[register]', err?.message, err?.code, err?.stack);
    if (isDbConnectionError(err)) {
      return res.status(503).json({
        error: 'Base de données indisponible. Vérifiez votre connexion ou l\'état de votre projet Supabase.',
      });
    }
    if (isDbSchemaError(err)) {
      return res.status(503).json({
        error: 'Base de données non configurée. Exécutez init-db-complet.sql dans Supabase (SQL Editor) et configurez DATABASE_URL sur Vercel.',
      });
    }
    if (isConfigError(err)) {
      return res.status(503).json({
        error: 'JWT_SECRET manquant. Configurez JWT_SECRET dans Vercel > Settings > Environment Variables.',
      });
    }
    next(err);
  }
}

function isDbConnectionError(err) {
  const code = err?.code || err?.cause?.code;
  return code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ENOTFOUND'
    || err?.message?.includes('Connection terminated') || err?.message?.includes('connection timeout');
}

function isDbSchemaError(err) {
  const code = err?.code || err?.cause?.code;
  const msg = err?.message || '';
  return code === '42P01' || code === 'DATABASE_URL_REQUIRED'
    || (msg.includes('relation') && msg.includes('does not exist'))
    || msg.includes('DATABASE_URL manquant');
}

function isConfigError(err) {
  const msg = (err?.message || '').toLowerCase();
  return msg.includes('jwt') || msg.includes('secret') || msg.includes('secretorkey');
}

// POST /api/auth/login - Login unifié (pseudo ou email) → retourne user ou admin
async function login(req, res, next) {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
    }
    const isEmail = identifier.includes('@');
    if (isEmail) {
      const admin = await Admin.findByEmail(identifier);
      if (admin) {
        const valid = await bcrypt.compare(password, admin.password_hash);
        if (valid) {
          const token = jwt.sign(
            { adminId: admin.id, type: 'admin' },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
          );
          return res.status(200).json({
            token,
            type: 'admin',
            admin: { id: admin.id, email: admin.email, photo: admin.photo },
          });
        }
      }
      const userByEmail = await User.findByEmail(identifier);
      if (userByEmail) {
        const valid = await bcrypt.compare(password, userByEmail.password_hash);
        if (valid) {
          if (userByEmail.status === 'banned') {
            return res.status(403).json({ error: 'Compte désactivé' });
          }
          const token = jwt.sign(
            { userId: userByEmail.id, type: 'user' },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
          );
          return res.status(200).json({
            token,
            type: 'user',
            user: { id: userByEmail.id, pseudo: userByEmail.pseudo, phone: userByEmail.phone, email: userByEmail.email, photo: userByEmail.photo },
          });
        }
      }
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    const user = await User.findByPseudo(identifier);
    if (user) {
      const valid = await bcrypt.compare(password, user.password_hash);
      if (valid) {
        if (user.status === 'banned') {
          return res.status(403).json({ error: 'Compte désactivé' });
        }
        const token = jwt.sign(
          { userId: user.id, type: 'user' },
          config.jwt.secret,
          { expiresIn: config.jwt.expiresIn }
        );
        return res.status(200).json({
          token,
          type: 'user',
          user: { id: user.id, pseudo: user.pseudo, phone: user.phone, email: user.email, photo: user.photo },
        });
      }
    }
    return res.status(401).json({ error: 'Identifiants incorrects' });
  } catch (err) {
    if (isDbConnectionError(err)) {
      return res.status(503).json({
        error: 'Base de données indisponible. Vérifiez votre connexion ou l\'état de votre projet Supabase.',
      });
    }
    if (isDbSchemaError(err)) {
      return res.status(503).json({
        error: 'Base de données non configurée. Exécutez init-db-complet.sql dans Supabase (SQL Editor) et configurez DATABASE_URL sur Vercel.',
      });
    }
    next(err);
  }
}

// GET /api/auth/admin/can-register - Vérifie si la création d'admin est possible (toujours autorisé)
async function canRegisterAdmin(req, res, next) {
  try {
    const count = await Admin.count();
    return res.json({ canRegister: true, count });
  } catch (err) {
    console.error('[canRegisterAdmin]', err?.message, err?.code);
    if (isDbConnectionError(err) || isDbSchemaError(err)) {
      return res.status(503).json({
        error: 'Base de données indisponible. Exécutez init-db-complet.sql dans Supabase et configurez DATABASE_URL sur Vercel.',
      });
    }
    next(err);
  }
}

// POST /api/auth/admin/register - Créer un compte admin (inscription libre)
async function registerAdmin(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }
    const existingEmail = await Admin.findByEmail(email.trim());
    if (existingEmail) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    const hash = await bcrypt.hash(password, 12);
    const admin = await Admin.create(email.trim().toLowerCase(), hash, '');
    const token = jwt.sign(
      { adminId: admin.id, type: 'admin' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    return res.status(201).json({
      token,
      type: 'admin',
      admin: { id: admin.id, email: admin.email, photo: admin.photo },
    });
  } catch (err) {
    console.error('[registerAdmin]', err?.message, err?.code);
    if (isDbConnectionError(err) || isDbSchemaError(err)) {
      return res.status(503).json({
        error: 'Base de données indisponible. Exécutez init-db-complet.sql dans Supabase et configurez DATABASE_URL sur Vercel.',
      });
    }
    next(err);
  }
}

// POST /api/auth/admin/login - Connexion admin (email + mot de passe) - gardé pour compatibilité
async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    const token = jwt.sign(
      { adminId: admin.id, type: 'admin' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    return res.status(200).json({
      token,
      type: 'admin',
      admin: { id: admin.id, email: admin.email, photo: admin.photo },
    });
  } catch (err) {
    if (isDbConnectionError(err)) {
      return res.status(503).json({
        error: 'Base de données indisponible. Vérifiez votre connexion Supabase.',
      });
    }
    next(err);
  }
}

module.exports = { register, login, adminLogin, registerAdmin, canRegisterAdmin };
