/**
 * Supprime tous les admins et en crée un nouveau
 * Usage: node server/scripts/clear-admins-and-create.js [email] [mot_de_passe]
 * Exemple: node server/scripts/clear-admins-and-create.js admin@laparte.com MonMotDePasse123!
 * Si email/mot de passe omis, utilise ADMIN_EMAIL et ADMIN_PASSWORD du .env
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');

const dbUrl = process.env.DATABASE_URL || 'json:./data/silencehub.json';
const useJson = !dbUrl || dbUrl.startsWith('json:');

async function run() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL || 'admin@laparte.com';
  const password = process.argv[3] || process.env.ADMIN_PASSWORD || 'Admin123!';

  if (!useJson) {
    console.log('Ce script ne fonctionne qu\'en mode JSON (DATABASE_URL=json:...).');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('Le mot de passe doit contenir au moins 6 caractères.');
    process.exit(1);
  }

  const dataPath = dbUrl.startsWith('json:')
    ? path.resolve(path.join(__dirname, '../..'), dbUrl.replace('json:', '').trim())
    : path.join(__dirname, '../../data/silencehub.json');

  if (!fs.existsSync(dataPath)) {
    console.error('Fichier de données introuvable:', dataPath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const previousCount = (data.admins || []).length;

  data.admins = [];
  const hash = await bcrypt.hash(password, 12);
  data.admins.push({
    id: require('crypto').randomUUID(),
    email: email.toLowerCase(),
    password_hash: hash,
    photo: '',
    created_at: new Date().toISOString(),
  });

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log(`${previousCount} administrateur(s) supprimé(s).`);
  console.log('Nouvel admin créé:', email);
  console.log('Connectez-vous sur /admin avec ces identifiants.');
  process.exit(0);
}

run().catch((e) => {
  console.error('Erreur:', e.message);
  process.exit(1);
});
