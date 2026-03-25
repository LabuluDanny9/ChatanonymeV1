/**
 * Aperçu court d’un message chat pour notifications / listes
 */

import { decodeHtmlEntities } from './textUtils';

export function getMessagePreview(message) {
  if (!message) return '';
  const mt = message.message_type || message.messageType;
  if (mt === 'voice') return 'Message vocal';
  if (mt === 'image') return 'Image';
  if (mt === 'video') return 'Vidéo';
  if (mt === 'file') return 'Fichier';
  const c = message.content;
  if (typeof c !== 'string' || !c.trim()) return 'Nouveau message';
  const text = decodeHtmlEntities(c).trim();
  return text.slice(0, 100) + (text.length > 100 ? '…' : '');
}
