/**
 * Champ de saisie commentaire — Style Facebook (pill) ou classique
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Image } from 'lucide-react';

const AVATAR_COLORS = [
  'bg-fb-blue/20 text-fb-blue',
  'bg-emerald-500/20 text-emerald-600',
  'bg-amber-500/20 text-amber-600',
];
const AVATAR_COLORS_APP = [
  'bg-app-purple/20 text-app-purple',
  'bg-app-blue/20 text-app-blue',
  'bg-app-success/20 text-app-success',
];

export default function CommentInput({
  onSubmit,
  placeholder = 'Écrire un commentaire...',
  replyingTo = null,
  onCancel,
  variant = 'default',
}) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = content.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(text);
      setContent('');
      onCancel?.();
    } catch {
      // erreur gérée par le parent
    } finally {
      setSubmitting(false);
    }
  };

  const isApp = variant === 'app';
  const isFacebook = variant === 'facebook';
  const avatarColor = (isApp ? AVATAR_COLORS_APP : AVATAR_COLORS)[Math.floor(Math.random() * 3)];
  if (isFacebook || isApp) {
    const inputWrap = isApp ? 'rounded-xl bg-app-card border border-app-border focus-within:border-app-purple' : 'rounded-full bg-fb-input-bg px-4 py-2.5 border border-transparent focus-within:bg-fb-card focus-within:border-fb-border';
    const inputClass = isApp ? 'flex-1 bg-transparent text-app-text text-[15px] placeholder-app-muted focus:outline-none' : 'flex-1 bg-transparent text-fb-text text-[15px] placeholder:text-fb-text-secondary focus:outline-none';
    const btnClass = isApp ? 'p-1.5 rounded-full bg-app-purple text-white hover:bg-app-purple/90 disabled:opacity-50' : 'p-1.5 rounded-full bg-fb-blue text-white hover:bg-fb-blue-hover disabled:opacity-50';
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${avatarColor}`}
        >
          ?
        </div>
        <div className={`flex-1 flex items-center gap-2 px-4 py-2.5 transition-all ${inputWrap}`}>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={inputClass}
            disabled={submitting}
          />
          {(content.trim() || focused) && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                className={`p-1.5 rounded-full transition-colors ${isApp ? 'hover:bg-app-surface text-app-muted hover:text-app-text' : 'hover:bg-fb-input-bg text-fb-text-secondary hover:text-fb-text'}`}
                title="Photo"
              >
                <Image className="w-4 h-4" />
              </button>
              <motion.button
                type="submit"
                disabled={!content.trim() || submitting}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-1.5 rounded-full disabled:cursor-not-allowed transition-colors ${btnClass}`}
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
        {replyingTo && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`text-xs ${isApp ? 'text-app-muted hover:text-app-text' : 'text-fb-text-secondary hover:text-fb-text'}`}
          >
            Annuler
          </button>
        )}
      </form>
    );
  }

  // Variant par défaut
  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColor}`}
      >
        ?
      </div>
      <div className="flex-1 min-w-0">
        {replyingTo && (
          <p className="text-xs text-fb-text-secondary mb-1">
            Réponse à <span className="font-medium text-fb-text">{replyingTo}</span>
          </p>
        )}
        <div className="flex gap-2 rounded-xl bg-fb-input-bg border border-fb-border overflow-hidden focus-within:ring-2 focus-within:ring-fb-blue/30 transition-all">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 bg-transparent text-fb-text placeholder:text-fb-text-secondary focus:outline-none text-sm"
            disabled={submitting}
          />
          <div className="flex flex-col justify-end p-2">
            {onCancel && (
              <button type="button" onClick={onCancel} className="text-xs text-fb-text-secondary hover:text-fb-text mb-1">
                Annuler
              </button>
            )}
            <motion.button
              type="submit"
              disabled={!content.trim() || submitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-fb-blue text-white hover:bg-fb-blue-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </form>
  );
}
