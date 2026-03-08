/**
 * Configuration Socket.IO partagée
 * En dev sans REACT_APP_API_URL : utilise le proxy (même origine)
 * transports: ['polling', 'websocket'] évite l'erreur "reserved bits" avec le proxy
 *
 * IMPORTANT: WebSocket ne fonctionne pas sur Vercel serverless (404 /ws).
 * Quand REACT_APP_API_URL est vide = déploiement full-stack Vercel = pas de WS.
 * On désactive Socket.IO dans ce cas pour éviter les 404 et on utilise le polling.
 */

export const SOCKET_API_URL = process.env.REACT_APP_API_URL || '';
export const SOCKET_WS_PATH = process.env.REACT_APP_WS_PATH || '/ws';

/** WebSocket activé uniquement si backend sur hôte séparé (Railway, etc.) */
export const WS_ENABLED = process.env.REACT_APP_WS_ENABLED !== 'false' && !!process.env.REACT_APP_API_URL;

export const getSocketOptions = (token) => ({
  path: SOCKET_WS_PATH,
  auth: { token },
  transports: ['polling', 'websocket'],
});
