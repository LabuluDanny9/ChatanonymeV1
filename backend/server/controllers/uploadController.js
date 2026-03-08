/**
 * Upload - Fichiers (images, vidéos, documents, audio)
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

// Sur Vercel : filesystem read-only sauf /tmp
const isVercel = !!process.env.VERCEL;
const UPLOAD_DIR = isVercel
  ? path.join(os.tmpdir(), 'chatanonyme-uploads')
  : path.join(__dirname, '../uploads');
const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_DOC = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const ALLOWED_AUDIO = ['audio/webm', 'audio/x-webm', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4'];

try {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (err) {
  console.warn('[upload] mkdir failed:', err?.message);
}

function getFileType(mimetype) {
  if (!mimetype) return 'file';
  if (mimetype.startsWith('image/') || ALLOWED_IMAGE.includes(mimetype)) return 'image';
  if (mimetype.startsWith('video/') || ALLOWED_VIDEO.includes(mimetype)) return 'video';
  if (mimetype.startsWith('audio/') || ALLOWED_AUDIO.includes(mimetype)) return 'audio';
  if (ALLOWED_DOC.includes(mimetype)) return 'file';
  return 'file';
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 100);
}

async function upload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Fichier requis' });
    }
    const { mimetype, size, originalname, filename } = req.file;
    if (size > MAX_SIZE) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Fichier trop volumineux (max 20 Mo)' });
    }
    const fileType = getFileType(mimetype);
    const ext = path.extname(originalname) || '.bin';
    const finalName = `${filename}${ext}`;
    const finalPath = path.join(UPLOAD_DIR, finalName);
    if (req.file.path !== finalPath) {
      fs.renameSync(req.file.path, finalPath);
    }
    const url = `/uploads/${finalName}`;
    return res.status(201).json({
      url,
      type: fileType,
      filename: sanitizeFilename(originalname),
      mimeType: mimetype,
      size,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { upload };
