/**
 * Chat Bubble — Texte, voice, image, vidéo, fichier
 * Supporte message_type + metadata (nouveau) et content JSON (legacy)
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, FileText, Video, CheckCheck, Edit2, Trash2 } from 'lucide-react';
import { getApiBaseUrl } from '../lib/api';
import { decodeHtmlEntities } from '../lib/textUtils';

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
  let meta = msg.metadata || {};
  if (typeof meta === 'string') {
    try {
      meta = JSON.parse(meta);
    } catch {
      meta = {};
    }
  }
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
  // Legacy: content JSON (ou JSON échappé par erreur côté serveur — on retente après décodage entités)
  const content = msg.content;
  if (!content || typeof content !== 'string') return { type: 'text', data: '' };

  const tryParsePayload = (raw) => {
    const parsed = JSON.parse(raw);
    if (parsed.type && parsed.data) {
      const d = parsed.data;
      const url =
        typeof d === 'string' && (d.startsWith('http') || d.startsWith('/') || d.startsWith('data:')) ? d : resolveUrl(d);
      return {
        type: parsed.type,
        data: url,
        duration: parsed.duration,
        name: parsed.name,
      };
    }
    return null;
  };

  try {
    const result = tryParsePayload(content);
    if (result) return result;
  } catch {
    try {
      const decoded = decodeHtmlEntities(content);
      const result = tryParsePayload(decoded);
      if (result) return result;
    } catch {
      /* affichage texte */
    }
  }

  // Évite d’afficher des Mo de base64 si le parse a échoué
  if (content.length > 2000 && /^(data:audio|data:video|\{)/.test(content.trim())) {
    return { type: 'text', data: '[Pièce jointe ou message vocal — impossible à afficher. Supprimez ce message et renvoyez.]' };
  }

  return { type: 'text', data: content };
}

function VoiceBubble({ data, duration, isAdmin, variant = 'default' }) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef(null);

  const btnClass =
    isAdmin
      ? 'bg-white/20 text-white'
      : variant === 'app'
        ? 'bg-app-purple/25 text-app-text'
        : 'bg-slate-200 text-slate-800';

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

  if (!data) {
    return (
      <span className={`text-xs ${variant === 'app' ? 'text-app-muted' : 'text-chat-muted'}`}>Audio indisponible</span>
    );
  }

  return (
    <div className="flex items-center gap-2 min-w-0 max-w-full">
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
        className={`p-2 rounded-full shrink-0 ${btnClass} ${error ? 'opacity-50' : ''}`}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </motion.button>
      <span
        className={`text-xs shrink-0 ${isAdmin ? 'text-white/90' : variant === 'app' ? 'text-app-muted' : 'opacity-80'}`}
      >
        {formatTime(duration || 0)}
      </span>
      {error && (
        <span className={`text-xs shrink-0 ${variant === 'app' ? 'text-app-danger' : 'text-chat-danger'}`}>
          Erreur lecture
        </span>
      )}
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

export default function ChatBubble({ message, isAdmin, isRead, createdAt, variant = 'default', onDelete, onEdit, canDelete, canEdit, userAvatar, adminAvatar }) {
  const content = parseMessage(message);
  const adminClass = variant === 'admin'
    ? 'bg-gradient-to-br from-admin-purple to-admin-blue text-white'
    : 'bg-chat-primary text-white';
  const userBubbleClass =
    variant === 'app'
      ? 'bg-app-card border border-app-border text-app-text'
      : 'bg-slate-100 border border-chat-border';
  const textClass = isAdmin
    ? 'text-white'
    : variant === 'admin'
      ? 'text-admin-text'
      : variant === 'app'
        ? 'text-app-text'
        : 'text-slate-800';
  const isTextEditable = content.type === 'text' && canEdit;
  const showActions = (canDelete || isTextEditable) && (onDelete || onEdit);

  const hasUserAvatar = !isAdmin && userAvatar && userAvatar.trim().length <= 4;
  const hasAdminAvatar = isAdmin && adminAvatar && adminAvatar.trim().length <= 4;
  const hasAdminAvatarImg = isAdmin && adminAvatar && adminAvatar.startsWith('http');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} group/bubble gap-2`}
    >
      {hasUserAvatar && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${variant === 'admin' ? 'bg-admin-surface' : 'bg-slate-200'}`}>
          {userAvatar}
        </div>
      )}
      <div
        className={`p-3 rounded-2xl min-w-0 max-w-[min(85%,28rem)] ${
          isAdmin ? adminClass : variant === 'admin' ? 'bg-admin-card border border-admin-border' : userBubbleClass
        }`}
      >
        {content.type === 'voice' && (
          <VoiceBubble
            data={content.data}
            duration={content.duration}
            isAdmin={isAdmin}
            variant={variant}
          />
        )}
        {content.type === 'image' && <ImageBubble data={content.data} />}
        {content.type === 'video' && <VideoBubble data={content.data} />}
        {content.type === 'file' && <FileBubble data={content.data} name={content.name} />}
        {content.type === 'text' && content.data && (
          <p
            className={`text-sm whitespace-pre-wrap break-words [overflow-wrap:anywhere] max-h-[min(40vh,14rem)] overflow-y-auto overscroll-contain pr-1 ${textClass}`}
          >
            {decodeHtmlEntities(content.data)}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span
            className={`text-xs ${
              isAdmin ? 'text-white/90' : variant === 'admin' ? 'text-admin-muted' : variant === 'app' ? 'text-app-muted' : 'text-chat-muted'
            }`}
          >
            {createdAt ? new Date(createdAt).toLocaleString('fr-FR') : ''}
          </span>
          {message.edited_at && (
            <span className="text-xs text-chat-muted italic">(modifié)</span>
          )}
          {isAdmin && isRead !== undefined && (
            <span className={`inline-flex ${isRead ? 'text-admin-success' : (variant === 'admin' ? 'text-admin-muted' : 'text-chat-muted')}`} title={isRead ? 'Lu' : 'Reçu'}>
              <CheckCheck className="w-4 h-4" strokeWidth={2} />
            </span>
          )}
        </div>
      </div>
      {(hasAdminAvatar || hasAdminAvatarImg) && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${variant === 'admin' ? 'bg-admin-purple/20' : 'bg-blue-100'}`}>
          {hasAdminAvatarImg ? (
            <img src={adminAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg">{adminAvatar}</span>
          )}
        </div>
      )}
      {showActions && (
        <div
          className={`flex items-center gap-1 ml-1 shrink-0 transition-opacity ${
            variant === 'app'
              ? 'opacity-100'
              : 'opacity-100 sm:opacity-0 sm:group-hover/bubble:opacity-100'
          }`}
        >
          {isTextEditable && onEdit && (
            <motion.button
              type="button"
              onClick={() => onEdit(message)}
              whileTap={{ scale: 0.9 }}
              className={`p-1.5 rounded-lg hover:bg-white/10 ${
                variant === 'admin'
                  ? 'text-admin-muted hover:text-admin-purple'
                  : variant === 'app'
                    ? 'text-app-muted hover:text-app-purple hover:bg-app-purple/10'
                    : 'text-chat-muted hover:text-chat-accent'
              }`}
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
              className={`p-1.5 rounded-lg ${
                variant === 'admin'
                  ? 'text-admin-muted hover:text-admin-danger hover:bg-admin-danger/10'
                  : variant === 'app'
                    ? 'text-app-muted hover:text-app-danger hover:bg-app-danger/10'
                    : 'text-chat-muted hover:text-chat-danger hover:bg-chat-danger/10'
              }`}
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
