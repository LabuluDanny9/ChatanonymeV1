/**
 * Utilitaires texte — Décodage entités HTML pour affichage correct
 * Les messages stockés avec &#039; (apostrophe) doivent s'afficher correctement.
 * Fonctionne sans document (SSR, tests).
 */

/**
 * Décode les entités HTML courantes dans une chaîne.
 * Sûr pour l'affichage en texte brut (pas de dangerouslySetInnerHTML).
 */
export function decodeHtmlEntities(str) {
  if (typeof str !== 'string') return str;
  if (!str) return str;
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}
