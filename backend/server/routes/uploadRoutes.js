/**
 * Routes upload - Fichiers authentifiés
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const uploadController = require('../controllers/uploadController');
const authUserOrAdmin = require('../middleware/authUserOrAdmin');

// Sur Vercel : filesystem read-only sauf /tmp
const isVercel = !!process.env.VERCEL;
const uploadDir = isVercel
  ? path.join(os.tmpdir(), 'chatanonyme-uploads')
  : path.join(__dirname, '../uploads');
try {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
  console.warn('[upload] mkdir failed, uploads may fail:', err?.message);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4', 'audio/x-webm',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const ok = allowed.includes(file.mimetype) || file.mimetype?.startsWith('audio/');
    if (ok) cb(null, true);
    else cb(new Error('Type de fichier non autorisé'));
  },
});

const router = express.Router();
router.post('/', authUserOrAdmin, upload.single('file'), uploadController.upload);

module.exports = router;
