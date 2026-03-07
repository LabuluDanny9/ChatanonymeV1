/**
 * Proxy de développement — redirige /api et /ws vers le backend
 * Les requêtes vers /api/* et /ws sont envoyées au backend (port 5001)
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const target = 'http://localhost:5001';
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
  app.use(
    '/ws',
    createProxyMiddleware({
      target,
      ws: true,
      changeOrigin: true,
      secure: false,
    })
  );
};
