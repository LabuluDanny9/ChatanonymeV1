/**
 * Configuration publique - WhatsApp, avatar admin pour affichage dans le chat, etc.
 */

const config = require('../config');
const Admin = require('../models/Admin');

async function getConfig(req, res) {
  try {
    const adminAvatar = await Admin.getFirstPhoto();
    return res.json({
      whatsappNumber: config.whatsapp?.number || '',
      adminAvatar: adminAvatar || '',
    });
  } catch {
    return res.json({
      whatsappNumber: config.whatsapp?.number || '',
      adminAvatar: '',
    });
  }
}

module.exports = { getConfig };
