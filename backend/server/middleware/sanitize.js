/**
 * Sanitization basique — XSS sur champs texte
 * Ne pas échapper : JSON technique (content vocal), URLs/metadata (sinon & et " cassent l’API).
 */

function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Clés dont la valeur est une URL ou un identifiant — pas d’escape HTML */
const RAW_STRING_KEYS = new Set(['url', 'data', 'filename', 'name', 'mimeType', 'size']);

function sanitizeString(str, key) {
  if (typeof str !== 'string') return str;
  const t = str.trim();
  if (t === '') return '';

  // Payload JSON (voice/image en fallback base64, etc.) — les " doivent rester intacts
  if (key === 'content' && t[0] === '{') {
    try {
      JSON.parse(t);
      return t;
    } catch {
      /* pas du JSON valide → texte utilisateur */
    }
  }

  if (RAW_STRING_KEYS.has(key)) {
    return t;
  }

  return escapeHtml(str).trim();
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    if (typeof v === 'string') {
      obj[key] = sanitizeString(v, key);
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      sanitizeObject(v);
    } else if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === 'string') {
          v[i] = escapeHtml(item).trim();
        } else if (item && typeof item === 'object') {
          sanitizeObject(item);
        }
      });
    }
  }
}

function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  next();
}

module.exports = { sanitizeBody, escapeHtml };
