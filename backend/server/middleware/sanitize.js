/**
 * Sanitization basique - Réduit risques XSS sur champs texte
 * Pour une protection renforcée, utiliser une lib dédiée (e.g. DOMPurify côté client).
 */

/**
 * Échappe uniquement les caractères dangereux pour XSS (< > & ").
 * Les apostrophes (') sont conservées pour un affichage correct en français (l'aise, L'Aparté, etc.).
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'string') {
          obj[key] = escapeHtml(obj[key]).trim();
        } else if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
}

module.exports = { sanitizeBody, escapeHtml };
