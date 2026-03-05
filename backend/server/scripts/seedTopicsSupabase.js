/**
 * Seed des sujets par défaut dans Supabase/PostgreSQL
 * Exécuté au démarrage si topics < 3
 */

const defaultTopics = require('./seedTopics');

async function seedTopicsIfNeeded(pool) {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM topics');
  if (rows[0].count >= 3) return;
  const existing = await pool.query('SELECT title FROM topics');
  const titles = existing.rows.map((r) => r.title);
  for (const t of defaultTopics) {
    if (!titles.includes(t.title)) {
      await pool.query(
        'INSERT INTO topics (title, content) VALUES ($1, $2)',
        [t.title, t.content || '']
      );
    }
  }
}

module.exports = seedTopicsIfNeeded;
