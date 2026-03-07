/**
 * Configuration Socket.IO partagée
 * En dev sans REACT_APP_API_URL : utilise le proxy (même origine)
 * transports: ['polling', 'websocket'] évite l'erreur "reserved bits" avec le proxy
 */

export const SOCKET_API_URL = process.env.REACT_APP_API_URL || '';
export const SOCKET_WS_PATH = process.env.REACT_APP_WS_PATH || '/ws';

export const getSocketOptions = (token) => ({
  path: SOCKET_WS_PATH,
  auth: { token },
  transports: ['polling', 'websocket'],
});
