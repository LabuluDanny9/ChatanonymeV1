/**
 * Extraction des thématiques depuis un header de contenu.
 *
 * Convention (cote backend seedTopics.js / topics stockés):
 *   #theme:CATEGORIE|SOUS-THEME
 *   contenu...
 */
export function parseTopicTheme(content) {
  const text = String(content || '');
  const match = text.match(/^#theme:([^|]+)\|([^\n]+)\n?/);
  if (!match) {
    return {
      category: 'Sans theme',
      subcategory: null,
      contentWithoutHeader: text,
    };
  }

  const category = String(match[1] || '').trim();
  const subcategory = String(match[2] || '').trim();

  return {
    category: category || 'Sans theme',
    subcategory: subcategory || null,
    contentWithoutHeader: text.replace(match[0], ''),
  };
}

