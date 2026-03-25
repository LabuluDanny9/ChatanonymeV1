/**
 * Paramètres plateforme — fonctionnalités (forum, chat privé, etc.)
 */

const { pool } = require('../config/database');

const DEFAULT_FEATURES = {
  forum: true,
  privateChat: true,
  broadcasts: true,
  registrations: true,
};

function mergeWithDefaults(stored) {
  const raw = stored && typeof stored === 'object' ? stored : {};
  return { ...DEFAULT_FEATURES, ...raw };
}

const PlatformSettings = {
  DEFAULT_FEATURES,

  async getMerged() {
    const { rows } = await pool.query(
      'SELECT features FROM platform_settings WHERE id = $1',
      ['global']
    );
    const stored = rows[0]?.features;
    const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
    return mergeWithDefaults(parsed);
  },

  async updatePartial(partial) {
    const current = await this.getMerged();
    const next = { ...current };
    for (const [k, v] of Object.entries(partial || {})) {
      if (k in DEFAULT_FEATURES && typeof v === 'boolean') {
        next[k] = v;
      }
    }
    await pool.query(
      `INSERT INTO platform_settings (id, features, updated_at)
       VALUES ('global', $1::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET features = EXCLUDED.features, updated_at = NOW()`,
      [JSON.stringify(next)]
    );
    return next;
  },
};

module.exports = PlatformSettings;
