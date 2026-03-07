/**
 * Création de l'admin initial si aucun admin n'existe
 * À appeler au démarrage du serveur ou manuellement.
 */

const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const config = require('../config');

async function seedAdmin() {
  const exists = await Admin.exists();
  if (exists) return false;
  const hash = await bcrypt.hash(config.admin.password, 12);
  await Admin.create(config.admin.email, hash, config.admin.photo || '');
  console.log('Admin initial créé:', config.admin.email);
  return true;
}

module.exports = seedAdmin;
