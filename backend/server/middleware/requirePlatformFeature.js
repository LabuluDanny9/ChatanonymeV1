/**
 * Bloque une route publique si la fonctionnalité est désactivée (paramètres plateforme).
 */

const PlatformSettings = require('../models/PlatformSettings');

function requirePlatformFeature(featureKey) {
  return async (req, res, next) => {
    try {
      const features = await PlatformSettings.getMerged();
      if (!features[featureKey]) {
        return res.status(403).json({
          error: 'Cette fonctionnalité est désactivée.',
          code: 'FEATURE_DISABLED',
          feature: featureKey,
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = requirePlatformFeature;
