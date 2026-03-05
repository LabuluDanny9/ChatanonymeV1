/**
 * Configuration publique - WhatsApp, etc.
 */

const config = require('../config');

function getConfig(req, res) {
  return res.json({
    whatsappNumber: config.whatsapp?.number || '',
  });
}

module.exports = { getConfig };
