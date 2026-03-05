/**
 * Modèle AuditLog - Logs d'audit pour actions admin
 */

const { pool } = require('../config/database');

const AuditLog = {
  async create(adminId, action, targetType = null, targetId = null, details = null, ipAddress = null) {
    await pool.query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [adminId, action, targetType, targetId, details ? JSON.stringify(details) : null, ipAddress]
    );
  },
};

module.exports = AuditLog;
