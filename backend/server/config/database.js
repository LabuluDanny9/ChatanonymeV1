/**
 * Configuration base de données - ChatAnonyme
 * Support PostgreSQL OU store JSON (fallback sans PostgreSQL).
 * Pour JSON : DATABASE_URL=json:./data/silencehub.json
 * Pour PostgreSQL : DATABASE_URL=postgresql://...
 */

const path = require('path');
const fs = require('fs');

const dbUrl = process.env.DATABASE_URL || '';
// Supabase/PostgreSQL quand DATABASE_URL est défini. JSON en fallback si vide ou json:
// Sur Vercel (serverless), le mode JSON échoue (filesystem read-only) → exiger DATABASE_URL
const isVercel = !!process.env.VERCEL;
// Note: pour que la plateforme reste opérationnelle en dev même si Supabase est mal configuré
// (ex: "Tenant or user not found"), on utilise le store JSON par défaut en environnement non-produit.
// Pour forcer PostgreSQL/Supabase, définis `DB_FORCE_POSTGRES=true`.
const useJson = !isVercel && process.env.DB_FORCE_POSTGRES !== 'true' && (
  !dbUrl ||
  dbUrl.startsWith('json:') ||
  (process.env.NODE_ENV || 'development') !== 'production'
);

let db;

if (isVercel && !dbUrl) {
  // Vercel sans DATABASE_URL : échec explicite au lieu d'erreur cryptique
  const err = new Error(
    'DATABASE_URL manquant sur Vercel. Configurez-la dans Vercel > Settings > Environment Variables. ' +
    'Utilisez l\'URL PostgreSQL de Supabase (port 6543 recommandé pour le pooler).'
  );
  err.code = 'DATABASE_URL_REQUIRED';
  db = {
    query: async () => { throw err; },
  };
} else if (useJson) {
  const dbPath = dbUrl.startsWith('json:')
    ? path.resolve(dbUrl.replace('json:', '').trim())
    : path.join(__dirname, '../../data/silencehub.json');
  const dir = path.dirname(dbPath);

  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (err) {
    console.warn('[db] mkdir failed for JSON store:', err?.message);
  }

  const seedTopics = require('../scripts/seedTopics');
  const initStore = () => {
    const defaultData = { users: [], admins: [], admin_assignments: [], conversations: [], messages: [], topics: [], topic_comments: [], audit_logs: [], broadcasts: [] };
    let data = defaultData;
    if (fs.existsSync(dbPath)) {
      try {
        data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (!data.broadcasts) data.broadcasts = [];
        if (!data.platform_settings || typeof data.platform_settings !== 'object') {
          data.platform_settings = { id: 'global', features: {} };
        }
        if (!data.users) data.users = [];
        if (!data.admin_assignments) data.admin_assignments = [];
        data.users = data.users.map((u) => ({ ...u, pseudo: u.pseudo || u.anonymous_id, password_hash: u.password_hash || '', phone: u.phone || null, email: u.email || null, photo: u.photo || null }));
        data.admins = (data.admins || []).map((a) => ({ ...a, photo: a.photo || '' }));
      } catch {
        data = defaultData;
      }
    }
    if (!data.topics) data.topics = [];
    // Normalise les sujets existants : si le store JSON contient déjà 3 sujets mais sans header thème,
    // on remplace par la version incluse dans seedTopics (pour l’UI thématique).
    const seedByTitle = new Map(seedTopics.map((t) => [t.title, t]));
    data.topics = (data.topics || []).map((t) => {
      const content = t?.content;
      const hasThemeHeader = typeof content === 'string' && content.trim().startsWith('#theme:');
      if (hasThemeHeader) return t;
      const seed = seedByTitle.get(t?.title);
      if (seed?.content) return { ...t, content: seed.content };
      return t;
    });
    const existingTitles = data.topics.map((t) => t.title);
    const toAdd = seedTopics.filter((t) => !existingTitles.includes(t.title));
    if (toAdd.length > 0) {
      toAdd.forEach((t) => data.topics.push({
        id: require('crypto').randomUUID(),
        ...t,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }));
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    }
    if (!data.broadcasts) {
      data.broadcasts = [];
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    }
    if (!data.topics) data.topics = [];
    if (!data.topic_comments) {
      data.topic_comments = [];
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    }
  };
  initStore();

  const load = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const save = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

  const uuid = () => require('crypto').randomUUID();

  db = {
    query: async (sql, params = []) => {
      const data = load();
      const $1 = params[0], $2 = params[1], $3 = params[2], $4 = params[3], $5 = params[4], $6 = params[5], $7 = params[6];

      if (sql.includes('SELECT * FROM users WHERE LOWER(pseudo)')) {
        const rows = data.users.filter((u) => u.pseudo && u.pseudo.toLowerCase() === $1.toLowerCase() && u.status !== $2);
        return { rows: rows.slice(0, 1) };
      }
      if (sql.includes('SELECT * FROM users WHERE LOWER(email)') && sql.includes('status')) {
        const rows = data.users.filter((u) => u.email && u.email.toLowerCase() === $1.toLowerCase() && u.status !== $2);
        return { rows: rows.slice(0, 1) };
      }
      if (sql.includes('SELECT * FROM users WHERE id') && !sql.includes('phone')) {
        const rows = data.users.filter((u) => u.id === $1);
        return { rows: rows.slice(0, 1) };
      }
      if (sql.includes('FROM users WHERE id = $1') || (sql.includes('FROM users WHERE id') && !sql.includes('ORDER BY'))) {
        const u = data.users.find((x) => x.id === $1);
        const row = u ? { id: u.id, pseudo: u.pseudo, phone: u.phone, email: u.email, photo: u.photo, status: u.status, created_at: u.created_at } : null;
        return { rows: row ? [row] : [] };
      }
      if (sql.includes('SELECT id, pseudo, phone, email, photo, status, created_at FROM users') && sql.includes('ORDER BY')) {
        const rows = data.users
          .filter((u) => u.status !== 'deleted')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(params[1] || 0, (params[1] || 0) + (params[0] || 50))
          .map((u) => ({ id: u.id, pseudo: u.pseudo, phone: u.phone, email: u.email, photo: u.photo, status: u.status, created_at: u.created_at }));
        return { rows };
      }
      if (sql.includes('SELECT COUNT(*)') && sql.includes('FROM users')) {
        const count = data.users.filter((u) => u.status === ($1 || 'active')).length;
        return { rows: [{ count, c: count }] };
      }
      if (sql.includes('INSERT INTO users') && sql.includes('pseudo')) {
        const id = uuid();
        const user = { id, pseudo: $1, password_hash: $2, phone: $3 || null, email: $4 || null, photo: $5 || null, status: 'active', created_at: new Date().toISOString() };
        data.users.push(user);
        save(data);
        return { rows: [user] };
      }
      if (sql.includes('UPDATE users SET status')) {
        const u = data.users.find((x) => x.id === $2);
        if (u) u.status = $1;
        save(data);
        return { rows: u ? [u] : [] };
      }
      if (sql.includes('UPDATE users SET phone')) {
        const u = data.users.find((x) => x.id === $1);
        if (u) {
          u.phone = $2 !== undefined ? $2 : u.phone;
          u.email = $3 !== undefined ? $3 : u.email;
          u.photo = $4 !== undefined ? $4 : u.photo;
        }
        save(data);
        return { rows: u ? [u] : [] };
      }

      if (sql.includes('SELECT * FROM admins WHERE LOWER(email)')) {
        const rows = data.admins.filter((a) => a.email.toLowerCase() === $1.toLowerCase());
        return { rows: rows.slice(0, 1) };
      }
      if (sql.includes('SELECT id, email, photo, created_at FROM admins WHERE id')) {
        const rows = data.admins.filter((a) => a.id === $1);
        return { rows: rows.slice(0, 1) };
      }
      if (sql.includes('SELECT 1 FROM admins')) {
        return { rows: data.admins.length ? [{}] : [] };
      }
      if (sql.includes('SELECT photo FROM admins') && sql.includes('LIMIT 1')) {
        const a = (data.admins || [])[0];
        return { rows: a ? [{ photo: a.photo || '' }] : [] };
      }
      if (sql.includes('SELECT COUNT(*)') && sql.includes('FROM admins')) {
        const count = (data.admins || []).length;
        return { rows: [{ count, c: count }] };
      }
      if (sql.includes('INSERT INTO admins') && sql.includes('photo')) {
        const id = uuid();
        const admin = { id, email: $1.toLowerCase(), password_hash: $2, photo: $3 || '', created_at: new Date().toISOString() };
        data.admins.push(admin);
        save(data);
        return { rows: [{ id, email: admin.email, photo: admin.photo, created_at: admin.created_at }] };
      }
      if (sql.includes('INSERT INTO admins') && !sql.includes('photo')) {
        const id = uuid();
        const admin = { id, email: $1.toLowerCase(), password_hash: $2, photo: '', created_at: new Date().toISOString() };
        data.admins.push(admin);
        save(data);
        return { rows: [{ id, email: admin.email, photo: admin.photo, created_at: admin.created_at }] };
      }
      if (sql.includes('UPDATE admins SET photo')) {
        const a = data.admins.find((x) => x.id === $1);
        if (a) a.photo = $2;
        save(data);
        return { rows: a ? [a] : [] };
      }
      if (sql.includes('DELETE FROM admins') && sql.includes('WHERE id')) {
        const id = $1;
        const primaryEmail = String(process.env.PRIMARY_ADMIN_EMAIL || 'labuludanny9@gmail.com').toLowerCase();
        const idx = data.admins.findIndex((a) => a.id === id);
        if (idx < 0) return { rows: [], rowCount: 0 };
        const victim = data.admins[idx];
        if (String(victim.email || '').toLowerCase() === primaryEmail) {
          return { rows: [], rowCount: 0 };
        }
        data.admins.splice(idx, 1);
        data.admin_assignments = (data.admin_assignments || []).filter((x) => x.admin_id !== id);
        save(data);
        return { rows: [{ id }], rowCount: 1 };
      }
      if (sql.includes('SELECT theme_key FROM admin_assignments WHERE admin_id')) {
        const rows = (data.admin_assignments || [])
          .filter((x) => x.admin_id === $1)
          .map((x) => ({ theme_key: x.theme_key }))
          .sort((a, b) => String(a.theme_key).localeCompare(String(b.theme_key)));
        return { rows };
      }
      if (sql.includes('SELECT admin_id, theme_key FROM admin_assignments')) {
        const rows = (data.admin_assignments || [])
          .map((x) => ({ admin_id: x.admin_id, theme_key: x.theme_key }))
          .sort((a, b) => String(a.admin_id).localeCompare(String(b.admin_id)) || String(a.theme_key).localeCompare(String(b.theme_key)));
        return { rows };
      }
      if (sql.includes('DELETE FROM admin_assignments WHERE admin_id')) {
        const before = (data.admin_assignments || []).length;
        data.admin_assignments = (data.admin_assignments || []).filter((x) => x.admin_id !== $1);
        save(data);
        return { rows: [], rowCount: before - data.admin_assignments.length };
      }
      if (sql.includes('INSERT INTO admin_assignments')) {
        const key = String($2 || '').toUpperCase();
        data.admin_assignments = data.admin_assignments || [];
        const exists = data.admin_assignments.some((x) => x.admin_id === $1 && x.theme_key === key);
        if (!exists) data.admin_assignments.push({ admin_id: $1, theme_key: key, created_at: new Date().toISOString() });
        save(data);
        return { rows: [{ admin_id: $1, theme_key: key }], rowCount: exists ? 0 : 1 };
      }
      if (sql.includes('SELECT 1 FROM admin_assignments WHERE admin_id') && sql.includes('theme_key')) {
        const key = String($2 || '').toUpperCase();
        const exists = (data.admin_assignments || []).some((x) => x.admin_id === $1 && x.theme_key === key);
        return { rows: exists ? [{}] : [] };
      }

      if (sql.includes('SELECT features FROM platform_settings WHERE id')) {
        const ps = data.platform_settings || { id: 'global', features: {} };
        return { rows: [{ features: ps.features || {} }] };
      }
      if (sql.includes('INSERT INTO platform_settings') && sql.includes('ON CONFLICT')) {
        data.platform_settings = data.platform_settings || { id: 'global', features: {} };
        let features = $1;
        if (typeof features === 'string') {
          try {
            features = JSON.parse(features);
          } catch {
            features = {};
          }
        }
        data.platform_settings.id = 'global';
        data.platform_settings.features = features && typeof features === 'object' ? features : {};
        data.platform_settings.updated_at = new Date().toISOString();
        save(data);
        return { rows: [{ id: 'global', features: data.platform_settings.features }] };
      }

      if (sql.includes('SELECT * FROM conversations WHERE user_id')) {
        const rows = data.conversations.filter((c) => c.user_id === $1);
        return { rows: rows.slice(0, 1) };
      }
      if (sql.includes('SELECT * FROM conversations WHERE id')) {
        const rows = data.conversations.filter((c) => c.id === $1);
        return { rows: rows.slice(0, 1) };
      }
      if (sql.includes('INSERT INTO conversations')) {
        const id = uuid();
        const conv = { id, user_id: $1, status: 'open', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        data.conversations.push(conv);
        save(data);
        return { rows: [conv] };
      }
      if (sql.includes('UPDATE conversations SET status')) {
        const c = data.conversations.find((x) => x.id === $2);
        if (c) c.status = $1;
        save(data);
        return { rows: c ? [c] : [] };
      }
      if (sql.includes('SELECT c.id, c.user_id') && sql.includes('FROM conversations c')) {
        const rows = data.conversations
          .map((c) => {
            const u = data.users.find((x) => x.id === c.user_id);
            return { ...c, anonymous_id: u?.pseudo || u?.anonymous_id, pseudo: u?.pseudo, user_status: u?.status };
          })
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(params[1] || 0, (params[1] || 0) + (params[0] || 50));
        return { rows };
      }
      if (sql.includes('SELECT COUNT(*)') && sql.includes('FROM conversations') && !sql.includes('status')) {
        const count = data.conversations.length;
        return { rows: [{ count, c: count }] };
      }
      if (sql.includes('SELECT COUNT(*)') && sql.includes('FROM conversations') && sql.includes('status')) {
        const count = data.conversations.filter((c) => c.status === $1).length;
        return { rows: [{ count, c: count }] };
      }

      if (sql.includes('INSERT INTO messages')) {
        const id = uuid();
        let meta = {};
        try { meta = typeof $6 === 'string' ? JSON.parse($6) : ($6 || {}); } catch {}
        const msg = {
          id, conversation_id: $1, sender_type: $2, sender_id: $3, content: $4 ?? '',
          message_type: $5 || 'text', metadata: meta, topic_id: $7 || null,
          is_read: false, deleted_at: null, created_at: new Date().toISOString(),
        };
        data.messages.push(msg);
        save(data);
        return { rows: [msg] };
      }
      if (sql.includes('FROM messages WHERE conversation_id') && sql.includes('deleted_at IS NULL')) {
        const rows = data.messages.filter((m) => m.conversation_id === $1 && !m.deleted_at).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        return { rows };
      }
      if (sql.includes('FROM messages WHERE conversation_id') && !sql.includes('deleted_at')) {
        const rows = data.messages.filter((m) => m.conversation_id === $1).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        return { rows };
      }
      if (sql.includes('SELECT * FROM messages WHERE id')) {
        const rows = data.messages.filter((m) => m.id === $1);
        return { rows: rows.slice(0, 1) };
      }
      if (sql.includes('UPDATE messages SET is_read = TRUE') && sql.includes('WHERE id')) {
        const m = data.messages.find((x) => x.id === $1);
        if (m) m.is_read = true;
        save(data);
        return { rows: [] };
      }
      if (sql.includes('UPDATE messages SET is_read = TRUE') && sql.includes('sender_type')) {
        data.messages.filter((m) => m.conversation_id === $1 && m.sender_type !== $2).forEach((m) => (m.is_read = true));
        save(data);
        return { rows: [] };
      }
      if (sql.includes('UPDATE messages SET deleted_at')) {
        const m = data.messages.find((x) => x.id === $1);
        if (m) m.deleted_at = new Date().toISOString();
        save(data);
        return { rows: m ? [m] : [] };
      }
      if (sql.includes('UPDATE messages SET content') && sql.includes('edited_at')) {
        const m = data.messages.find((x) => x.id === $1);
        if (m) {
          m.content = $2 ?? '';
          m.message_type = $3 || 'text';
          try { m.metadata = typeof $4 === 'string' ? JSON.parse($4) : ($4 || {}); } catch {}
          m.edited_at = new Date().toISOString();
        }
        save(data);
        return { rows: m ? [m] : [] };
      }
      if (sql.includes('UPDATE messages SET content') && !sql.includes('edited_at')) {
        const m = data.messages.find((x) => x.id === $1);
        if (m) {
          m.content = $2 ?? '';
          m.message_type = $3 || 'text';
          try { m.metadata = typeof $4 === 'string' ? JSON.parse($4) : ($4 || {}); } catch {}
        }
        save(data);
        return { rows: m ? [m] : [] };
      }

      if (sql.includes('INSERT INTO topics')) {
        const id = uuid();
        const topic = { id, title: $1, content: $2 || '', published_at: new Date().toISOString(), created_at: new Date().toISOString() };
        data.topics.push(topic);
        save(data);
        return { rows: [topic] };
      }
      if (sql.includes('SELECT * FROM topics ORDER BY published_at')) {
        const rows = data.topics
          .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
          .slice(params[1] || 0, (params[1] || 0) + (params[0] || 20));
        return { rows };
      }
      if (sql.includes('SELECT COUNT(*)') && sql.includes('FROM topics')) {
        const count = data.topics.length;
        return { rows: [{ count, c: count }] };
      }
      if (sql.includes('SELECT * FROM topics WHERE id')) {
        const rows = data.topics.filter((t) => t.id === $1);
        return { rows: rows.slice(0, 1) };
      }
      if (sql.includes('UPDATE topics SET title')) {
        const t = data.topics.find((x) => x.id === $3);
        if (t) {
          t.title = $1;
          t.content = $2 || '';
        }
        save(data);
        return { rows: t ? [t] : [] };
      }
      if (sql.includes('DELETE FROM topics')) {
        data.topics = data.topics.filter((t) => t.id !== $1);
        save(data);
        return { rows: [] };
      }

      if (sql.includes('INSERT INTO audit_logs')) {
        const id = uuid();
        data.audit_logs.push({ id, admin_id: $1, action: $2, target_type: $3, target_id: $4, details: $5, ip_address: $6, created_at: new Date().toISOString() });
        save(data);
        return { rows: [] };
      }

      if (sql.includes('INSERT INTO broadcasts')) {
        const id = uuid();
        const broadcast = { id, admin_id: $1, content: $2, created_at: new Date().toISOString() };
        (data.broadcasts = data.broadcasts || []).push(broadcast);
        save(data);
        return { rows: [broadcast] };
      }
      if (sql.includes('SELECT * FROM broadcasts')) {
        const rows = (data.broadcasts || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(params[1] || 0, (params[1] || 0) + (params[0] || 50));
        return { rows };
      }
      if (sql.includes('SELECT COUNT(*)') && sql.includes('FROM broadcasts')) {
        const count = (data.broadcasts || []).length;
        return { rows: [{ count, c: count }] };
      }

      if (sql.includes('INSERT INTO topic_comments')) {
        if (!data.topic_comments) data.topic_comments = [];
        const id = uuid();
        const comment = {
          id, topic_id: $1, author_id: $2, author_type: $3, author_name: $4,
          author_photo: $5 || null, parent_id: $6 || null, content: $7 || '', likes_count: 0,
          created_at: new Date().toISOString(),
        };
        data.topic_comments.push(comment);
        save(data);
        return { rows: [comment] };
      }
      if (sql.includes('FROM topic_comments WHERE topic_id') && sql.includes('ORDER BY')) {
        const rows = (data.topic_comments || []).filter((c) => c.topic_id === $1).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        return { rows };
      }
      if (sql.includes('UPDATE topic_comments SET likes_count') && sql.includes('WHERE id')) {
        const c = (data.topic_comments || []).find((x) => x.id === $1);
        if (c) c.likes_count = (c.likes_count || 0) + 1;
        save(data);
        return { rows: c ? [c] : [] };
      }
      if (sql.includes('SELECT COUNT(*)') && sql.includes('FROM topic_comments') && sql.includes('topic_id')) {
        const count = (data.topic_comments || []).filter((c) => c.topic_id === $1).length;
        return { rows: [{ count, c: count }] };
      }
      if (sql.includes('SELECT * FROM topic_comments WHERE id')) {
        const c = (data.topic_comments || []).find((x) => x.id === $1);
        return { rows: c ? [c] : [] };
      }
      if (sql.includes('DELETE FROM topic_comments') && sql.includes('WHERE id')) {
        const toDelete = new Set([$1]);
        let changed = true;
        while (changed) {
          changed = false;
          for (const c of data.topic_comments || []) {
            if (toDelete.has(c.parent_id) && !toDelete.has(c.id)) {
              toDelete.add(c.id);
              changed = true;
            }
          }
        }
        data.topic_comments = (data.topic_comments || []).filter((c) => !toDelete.has(c.id));
        save(data);
        return { rows: [], rowCount: toDelete.size };
      }

      return { rows: [] };
    },
  };
} else {
  const { Pool } = require('pg');
  // Sur Vercel : URL Supabase pooler + workaround recommandé, pool réduit pour serverless
  let connStr = dbUrl;
  if (isVercel && (dbUrl.includes('pooler.supabase.com') || dbUrl.includes('supabase.co')) && !dbUrl.includes('workaround=')) {
    connStr = dbUrl.includes('?') ? `${dbUrl}&workaround=supabase-pooler.vercel` : `${dbUrl}?workaround=supabase-pooler.vercel`;
  }
  const pgPool = new Pool({
    connectionString: connStr,
    max: isVercel ? 2 : 20,
    idleTimeoutMillis: isVercel ? 5000 : 30000,
    connectionTimeoutMillis: 8000,
    allowExitOnIdle: isVercel,
    ssl: (connStr.includes('supabase.co') || connStr.includes('pooler.supabase.com')) ? { rejectUnauthorized: false } : false,
  });
  pgPool.on('error', (err) => console.error('Erreur PostgreSQL:', err.message));
  db = pgPool;
}

module.exports = { pool: db, useJson };
