/**
 * Seed des données de démonstration
 * Usage: npm run seed-demo
 * Crée des utilisateurs, sujets et messages de test.
 */

const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { pool, useJson } = require('../config/database');
const seedTopics = require('./seedTopics');
const config = require('../config');

const uuid = () => require('crypto').randomUUID();

async function seedDemoJson() {
  const dbUrl = process.env.DATABASE_URL || 'json:./data/silencehub.json';
  const dataPath = dbUrl.startsWith('json:')
    ? path.resolve(path.join(__dirname, '../..'), dbUrl.replace('json:', '').trim())
    : path.join(__dirname, '../../data/silencehub.json');

  let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  if (!data.users) data.users = [];
  if (!data.topics) data.topics = [];
  if (!data.conversations) data.conversations = [];
  if (!data.messages) data.messages = [];

  // Sujets par défaut
  const existingTitles = data.topics.map((t) => t.title);
  for (const t of seedTopics) {
    if (!existingTitles.includes(t.title)) {
      data.topics.push({
        id: uuid(),
        title: t.title,
        content: t.content || '',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    }
  }

  // Utilisateur démo (mot de passe: demo123)
  const demoHash = await bcrypt.hash('demo123', 12);
  const demoUser = data.users.find((u) => u.pseudo === 'demo');
  if (!demoUser) {
    const id = uuid();
    data.users.push({
      id,
      pseudo: 'demo',
      password_hash: demoHash,
      phone: null,
      email: 'demo@silencehub.local',
      photo: null,
      status: 'active',
      created_at: new Date().toISOString(),
    });
    console.log('Utilisateur démo créé: demo / demo123');
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('Données démo seedées (mode JSON).');
}

async function seedDemoPostgres() {
  const { rows: topicCount } = await pool.query('SELECT COUNT(*)::int AS c FROM topics');
  if (topicCount[0].c < 3) {
    const { rows: existing } = await pool.query('SELECT title FROM topics');
    const titles = existing.map((r) => r.title);
    for (const t of seedTopics) {
      if (!titles.includes(t.title)) {
        await pool.query('INSERT INTO topics (title, content) VALUES ($1, $2)', [t.title, t.content || '']);
      }
    }
    console.log('Sujets par défaut insérés.');
  }
  console.log('Données démo seedées (PostgreSQL).');
}

async function run() {
  try {
    if (useJson) {
      await seedDemoJson();
    } else {
      await seedDemoPostgres();
    }
    process.exit(0);
  } catch (e) {
    console.error('Erreur:', e.message);
    process.exit(1);
  }
}

run();
