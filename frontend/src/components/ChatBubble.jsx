/**
 * Chat Bubble — Texte, voice, image, vidéo, fichier
 * Supporte message_type + metadata (nouveau) et content JSON (legacy)
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, FileText, Video, CheckCheck, Edit2, Trash2 } from 'lucide-react';
import { getApiBaseUrl } from '../lib/api';

function resolveUrl(url) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const base = getApiBaseUrl().replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

function parseMessage(msg) {
  if (!msg) return { type: 'text', data: '' };
  // Nouveau format: message_type + metadata
  const mt = msg.message_type || msg.messageType;
  const meta = msg.metadata || {};
  if (mt === 'voice') {
    const url = meta.url || meta.data;
    return { type: 'voice', data: resolveUrl(url), duration: meta.duration };
  }
  if (mt === 'image') {
    const url = meta.url || meta.data;
    return { type: 'image', data: resolveUrl(url) };
  }
  if (mt === 'video') {
    const url = meta.url || meta.data;
    return { type: 'video', data: resolveUrl(url) };
  }
  if (mt === 'file' || meta.url) {
    const url = meta.url || meta.data;
    return { type: 'file', data: resolveUrl(url), name: meta.filename || meta.name };
  }
  // Legacy: content JSON
  const content = msg.content;
  if (!content || typeof content !== 'string') return { type: 'text', data: '' };
  try {
    const parsed = JSON.parse(content);
    if (parsed.type && parsed.data) {
      const d = parsed.data;
      const url = typeof d === 'string' && (d.startsWith('http') || d.startsWith('/') || d.startsWith('data:')) ? d : resolveUrl(d);
      return {
        type: parsed.type,
        data: url,
        duration: parsed.duration,
        name: parsed.name,
      };
    }
  } catch {}
  return { type: 'text', data: content };
}

function VoiceBubble({ data, duration, isAdmin }) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current || !data) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      setError(false);
      setPlaying(true);
      audioRef.current.play().catch(() => {
        setError(true);
        setPlaying(false);
      });
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!data) return <span className="text-xs text-chat-muted">Audio indisponible</span>;

  return (
    <div className="flex items-center gap-2">
      <audio
        ref={audioRef}
        src={data}
        preload="auto"
        onEnded={() => setPlaying(false)}
        onError={() => setError(true)}
        onCanPlayThrough={() => setError(false)}
      />
      <motion.button
        type="button"
        onClick={togglePlay}
        disabled={error}
        whileTap={{ scale: 0.95 }}
        className={`p-2 rounded-full ${isAdmin ? 'bg-white/20' : 'bg-slate-200'} ${error ? 'opacity-50' : ''}`}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </motion.button>
      <span className="text-xs opacity-80">{formatTime(duration || 0)}</span>
      {error && <span className="text-xs text-chat-danger">Erreur lecture</span>}
    </div>
  );
}

function ImageBubble({ data }) {
  return (
    <img
      src={data}
      alt="Image"
      className="max-w-full max-h-48 rounded-lg object-contain cursor-pointer"
      onClick={() => window.open(data, '_blank')}
    />
  );
}

function VideoBubble({ data }) {
  return (
    <video
      src={data}
      controls
      className="max-w-full max-h-48 rounded-lg object-contain"
      playsInline
    />
  );
}

function FileBubble({ data, name }) {
  return (
    <a
      href={data}
      download={name}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
    >
      <FileText className="w-5 h-5 shrink-0" />
      <span className="text-sm truncate max-w-[150px]">{name || 'Fichier'}</span>
    </a>
  );
}

export default function ChatBubble({ message, isAdmin, isRead, createdAt, variant = 'default', onDelete, onEdit, canDelete, canEdit }) {
  const content = parseMessage(message);
  const adminClass = variant === 'admin'
    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
    : 'bg-chat-primary text-white';
  const textClass = isAdmin ? 'text-white' : 'text-slate-800';
  const isTextEditable = content.type === 'text' && canEdit;
  const showActions = (canDelete || isTextEditable) && (onDelete || onEdit);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} group/bubble`}
    >
      <div
        className={`p-3 rounded-2xl max-w-[75%] ${
          isAdmin ? adminClass : 'bg-slate-100 border border-chat-border'
        }`}
      >
        {content.type === 'voice' && (
          <VoiceBubble data={content.data} duration={content.duration} isAdmin={isAdmin} />
        )}
        {content.type === 'image' && <ImageBubble data={content.data} />}
        {content.type === 'video' && <VideoBubble data={content.data} />}
        {content.type === 'file' && <FileBubble data={content.data} name={content.name} />}
        {content.type === 'text' && content.data && (
          <p className={`text-sm whitespace-pre-wrap ${textClass}`}>{content.data}</p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-xs ${isAdmin ? 'text-white/90' : 'text-chat-muted'}`}>
            {createdAt ? new Date(createdAt).toLocaleString('fr-FR') : ''}
          </span>
          {message.edited_at && (
            <span className="text-xs text-chat-muted italic">(modifié)</span>
          )}
          {isAdmin && isRead !== undefined && (
            <span className={`inline-flex ${isRead ? 'text-emerald-400' : 'text-chat-muted'}`} title={isRead ? 'Lu' : 'Reçu'}>
              <CheckCheck className="w-4 h-4" strokeWidth={2} />
            </span>
          )}
        </div>
      </div>
      {showActions && (
        <div className="flex items-center gap-1 ml-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
          {isTextEditable && onEdit && (
            <motion.button
              type="button"
              onClick={() => onEdit(message)}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg text-chat-muted hover:text-chat-accent hover:bg-white/10"
              title="Modifier"
            >
              <Edit2 className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>
          )}
          {canDelete && onDelete && (
            <motion.button
              type="button"
              onClick={() => onDelete(message.id)}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg text-chat-muted hover:text-chat-danger hover:bg-chat-danger/10"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}
