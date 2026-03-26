/**
 * Assignations admin <-> thématiques
 */

const { pool } = require('../config/database');

const AdminAssignment = {
  async findThemesByAdminId(adminId) {
    const { rows } = await pool.query(
      'SELECT theme_key FROM admin_assignments WHERE admin_id = $1 ORDER BY theme_key ASC',
      [adminId]
    );
    return rows.map((r) => r.theme_key);
  },

  async findAll() {
    const { rows } = await pool.query(
      'SELECT admin_id, theme_key FROM admin_assignments ORDER BY admin_id, theme_key'
    );
    return rows;
  },

  async replaceForAdmin(adminId, themeKeys) {
    const clean = [...new Set((themeKeys || []).map((k) => String(k || '').trim().toUpperCase()).filter(Boolean))];
    await pool.query('DELETE FROM admin_assignments WHERE admin_id = $1', [adminId]);
    for (const key of clean) {
      await pool.query(
        `INSERT INTO admin_assignments (admin_id, theme_key)
         VALUES ($1, $2)
         ON CONFLICT (admin_id, theme_key) DO NOTHING`,
        [adminId, key]
      );
    }
    return clean;
  },

  async isAssignedToTheme(adminId, themeKey) {
    const key = String(themeKey || '').trim().toUpperCase();
    if (!key) return true;
    const { rows } = await pool.query(
      'SELECT 1 FROM admin_assignments WHERE admin_id = $1 AND theme_key = $2 LIMIT 1',
      [adminId, key]
    );
    return rows.length > 0;
  },
};

module.exports = AdminAssignment;

