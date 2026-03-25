/**
 * Configuration publique - WhatsApp, avatar admin pour affichage dans le chat, etc.
 */

const config = require('../config');
const Admin = require('../models/Admin');
const PlatformSettings = require('../models/PlatformSettings');

async function getConfig(req, res) {
  try {
    const [adminAvatar, features] = await Promise.all([
      Admin.getFirstPhoto(),
      PlatformSettings.getMerged().catch(() => PlatformSettings.DEFAULT_FEATURES),
    ]);
    return res.json({
      whatsappNumber: config.whatsapp?.number || '',
      adminAvatar: adminAvatar || '',
      features,
    });
  } catch {
    return res.json({
      whatsappNumber: config.whatsapp?.number || '',
      adminAvatar: '',
      features: PlatformSettings.DEFAULT_FEATURES,
    });
  }
}

module.exports = { getConfig };
