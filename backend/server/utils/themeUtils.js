/**
 * Helpers de thème: extraction des clés depuis les contenus topic (#theme:CLE|Sous-theme)
 */

function parseThemeKeyFromContent(content) {
  const text = String(content || '').trim();
  const firstLine = text.split('\n')[0] || '';
  const m = firstLine.match(/^#theme:([^|\n]+)(?:\|.*)?$/i);
  if (!m) return null;
  return String(m[1] || '').trim().toUpperCase() || null;
}

module.exports = {
  parseThemeKeyFromContent,
};

