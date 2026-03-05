/**
 * Pièces jointes — Images, vidéos, PDF, DOC, audio
 * Upload vers API + preview + progress
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Image, FileText, File, Music, Video, X } from 'lucide-react';
import api, { getApiBaseUrl } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

const ACCEPT = 'image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,audio/*';
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export default function AttachmentPicker({ onSelect, onClose }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    if (f.size > MAX_SIZE) {
      setError('Fichier trop volumineux (max 20 Mo)');
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    } else if (f.type.startsWith('video/')) {
      setPreview(null);
    } else {
      setPreview(null);
    }
  };

  const getFileType = (f) => {
    if (f?.type?.startsWith('image/')) return 'image';
    if (f?.type?.startsWith('video/')) return 'video';
    if (f?.type?.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const handleSend = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/api/upload', formData, {
        onUploadProgress: (e) => {
          setProgress(e.loaded && e.total ? Math.round((e.loaded / e.total) * 100) : 0);
        },
      });
      const base = getApiBaseUrl().replace(/\/$/, '');
      const fullUrl = data.url?.startsWith('http') ? data.url : `${base}${data.url?.startsWith('/') ? '' : '/'}${data.url || ''}`;
      onSelect({
        type: data.type,
        url: fullUrl,
        filename: data.filename,
        metadata: { url: fullUrl, filename: data.filename, mimeType: data.mimeType, size: data.size },
      });
      setFile(null);
      setPreview(null);
      setProgress(0);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'upload');
      toast.error(err.response?.data?.error || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const getIcon = () => {
    if (!file) return;
    if (file.type.startsWith('image/')) return <Image className="w-8 h-8 text-chat-primary" />;
    if (file.type.startsWith('video/')) return <Video className="w-8 h-8 text-chat-primary" />;
    if (file.type.startsWith('audio/')) return <Music className="w-8 h-8 text-chat-primary" />;
    return <FileText className="w-8 h-8 text-chat-primary" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 rounded-xl bg-white border border-chat-border shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-800">Images & fichiers</span>
        <motion.button
          type="button"
          onClick={onClose}
          whileTap={{ scale: 0.95 }}
          className="p-1 rounded-lg text-chat-muted hover:text-slate-800"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFileChange}
        className="hidden"
      />
      {!file ? (
        <motion.button
          type="button"
          onClick={() => inputRef.current?.click()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-chat-border text-chat-muted hover:border-chat-primary hover:text-chat-primary hover:bg-blue-50/30 transition-colors"
        >
          <Image className="w-6 h-6" />
          Images, vidéos, PDF, documents
        </motion.button>
      ) : (
        <div className="space-y-3">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full max-h-40 object-contain rounded-lg" />
          ) : file.type.startsWith('video/') ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              <Video className="w-12 h-12 text-chat-primary" />
              <span className="text-sm text-slate-800 truncate flex-1">{file.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              {getIcon()}
              <span className="text-sm text-slate-800 truncate flex-1">{file.name}</span>
            </div>
          )}
          {progress > 0 && (
            <div className="h-1 rounded-full bg-slate-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-chat-primary"
              />
            </div>
          )}
          {error && <p className="text-sm text-chat-danger">{error}</p>}
          <div className="flex gap-2">
            <motion.button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm disabled:opacity-50"
            >
              Changer
            </motion.button>
            <motion.button
              type="button"
              onClick={handleSend}
              disabled={uploading}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2 rounded-xl bg-chat-primary text-white font-medium text-sm disabled:opacity-50 hover:bg-blue-700"
            >
              {uploading ? 'Envoi...' : 'Envoyer'}
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
