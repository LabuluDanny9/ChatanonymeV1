/**
 * Commentaire — Style Facebook (bulles, réactions)
 * Boutons : Supprimer (admin ou auteur), Répondre en privé (admin→user, user→admin)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, MessageCircle, Trash2, Mail } from 'lucide-react';
import CommentInput from './CommentInput';
import { decodeHtmlEntities } from '../../lib/textUtils';

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

function getAvatarColor(name) {
  const idx = (name?.length || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Comment({
  comment,
  replies = [],
  onReply,
  onLike,
  onDelete,
  onReplyPrivate,
  canDelete = false,
  canReplyPrivate = false,
  depth = 0,
  maxDepth = 4,
  variant = 'default',
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [privateContent, setPrivateContent] = useState('');
  const [sendingPrivate, setSendingPrivate] = useState(false);

  const handleReply = async (content) => {
    const newReply = await onReply(comment.id, content);
    if (newReply) setShowReplyInput(false);
  };

  const handleLike = () => {
    onLike?.(comment.id);
  };

  const handleReplyPrivate = async () => {
    if (!privateContent.trim() || !onReplyPrivate || sendingPrivate) return;
    setSendingPrivate(true);
    try {
      await onReplyPrivate(comment.id, privateContent.trim());
      setShowPrivateModal(false);
      setPrivateContent('');
    } catch {
      // Erreur gérée par le parent (toast)
    } finally {
      setSendingPrivate(false);
    }
  };

  const isAdminComment = comment.author_type === 'admin';
  const displayName = isAdminComment ? 'ChatAnonyme' : (comment.author_name || 'Anonyme');
  const isApp = variant === 'app';
  const avatarColor = isApp ? AVATAR_COLORS_APP[(comment.author_name?.length || 0) % AVATAR_COLORS_APP.length] : getAvatarColor(comment.author_name);
  const initial = (comment.author_name || '?')[0].toUpperCase();
  const hasEmojiAvatar = comment.author_photo && comment.author_photo.trim().length <= 4;
  const likesDisplay = comment.likes_count || 0;

  if (variant === 'facebook' || variant === 'app') {
    const borderClass = variant === 'app' ? 'border-app-border' : 'border-fb-border';
    const bubbleBg = variant === 'app' ? 'bg-app-surface' : 'bg-fb-input-bg';
    const textClass = variant === 'app' ? 'text-app-text' : 'text-fb-text';
    const mutedClass = variant === 'app' ? 'text-app-muted' : 'text-fb-text-secondary';
    const accentClass = variant === 'app' ? 'text-app-purple' : 'text-fb-blue';
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${depth > 0 ? `ml-10 pl-3 border-l-2 ${borderClass}` : ''}`}
      >
        <div className="flex gap-2">
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${
              isAdminComment ? (variant === 'app' ? 'bg-app-card border border-app-border' : 'bg-white border border-fb-border') : hasEmojiAvatar ? (variant === 'app' ? 'bg-app-surface' : 'bg-fb-input-bg') : `text-xs font-semibold ${avatarColor}`
            }`}
          >
            {isAdminComment ? (
              <img src="/logo.png" alt="ChatAnonyme" className="w-full h-full object-cover" />
            ) : hasEmojiAvatar ? (
              <span className="text-base">{comment.author_photo}</span>
            ) : (
              <span className="text-xs font-semibold">{initial}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`inline-block rounded-2xl rounded-tl-[4px] px-3 py-2 ${bubbleBg}`}>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className={`font-semibold text-[15px] ${textClass}`}>{displayName}</span>
                {comment.author_type === 'admin' && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${variant === 'app' ? 'bg-app-purple/20 text-app-purple' : 'bg-fb-blue/10 text-fb-blue'}`}>
                    Admin
                  </span>
                )}
              </div>
              <p className={`${textClass} text-[15px] mt-0.5 whitespace-pre-wrap`}>{decodeHtmlEntities(comment.content)}</p>
            </div>
            <div className="flex items-center gap-4 mt-1 pl-1 flex-wrap">
              <button
                type="button"
                onClick={handleLike}
                className={`text-[13px] font-medium ${mutedClass} hover:underline`}
              >
                J'aime
              </button>
              {likesDisplay > 0 && (
                <span className={`text-[13px] ${mutedClass}`}>
                  {likesDisplay} j'aime
                </span>
              )}
              {depth < maxDepth && (
                <button
                  type="button"
                  onClick={() => setShowReplyInput((v) => !v)}
                  className={`text-[13px] font-medium ${mutedClass} hover:underline`}
                >
                  Répondre
                </button>
              )}
              {canReplyPrivate && (
                <button
                  type="button"
                  onClick={() => setShowPrivateModal(true)}
                  className={`text-[13px] font-medium ${accentClass} hover:underline flex items-center gap-1`}
                >
                  <Mail className="w-3.5 h-3.5" /> Répondre en privé
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete?.(comment.id)}
                  className="text-[13px] font-medium text-app-danger hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </button>
              )}
              <span className={`text-[13px] ${mutedClass}`}>{formatDate(comment.created_at)}</span>
            </div>
          </div>
        </div>

        {showReplyInput && (
          <div className="mt-2 ml-10">
            <CommentInput
              placeholder="Écrire une réponse..."
              replyingTo={displayName}
              onSubmit={handleReply}
              onCancel={() => setShowReplyInput(false)}
              variant={variant}
            />
          </div>
        )}

        {replies.length > 0 && (
          <div className="mt-2 ml-2 space-y-2">
            {replies.map((r) => (
              <Comment
                key={r.id}
                comment={r}
                replies={r.replies || []}
                onReply={onReply}
                onLike={onLike}
                onDelete={onDelete}
                onReplyPrivate={onReplyPrivate}
                canDelete={canDelete}
                canReplyPrivate={canReplyPrivate}
                depth={depth + 1}
                maxDepth={maxDepth}
                variant={variant}
              />
            ))}
          </div>
        )}

        {/* Modal Répondre en privé */}
        {showPrivateModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowPrivateModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-xl shadow-xl p-4 w-full max-w-md ${variant === 'app' ? 'bg-app-card border border-app-border' : 'bg-fb-card'}`}
            >
              <h3 className={`font-semibold mb-2 ${variant === 'app' ? 'text-app-text' : 'text-fb-text'}`}>Répondre en privé</h3>
              <p className={`text-[13px] mb-3 ${variant === 'app' ? 'text-app-muted' : 'text-fb-text-secondary'}`}>
                Votre message sera envoyé dans la conversation privée.
              </p>
              <textarea
                value={privateContent}
                onChange={(e) => setPrivateContent(e.target.value)}
                placeholder="Votre message..."
                rows={3}
                className={`w-full px-3 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 ${
                  variant === 'app'
                    ? 'bg-app-surface border border-app-border text-app-text placeholder-app-muted focus:ring-app-purple/50'
                    : 'bg-fb-input-bg border-0 text-fb-text placeholder:text-fb-text-secondary focus:ring-fb-blue/30'
                }`}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowPrivateModal(false); setPrivateContent(''); }}
                  className={`px-4 py-2 rounded-lg font-medium ${variant === 'app' ? 'text-app-muted hover:bg-app-surface' : 'text-fb-text-secondary hover:bg-fb-input-bg'}`}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleReplyPrivate}
                  disabled={!privateContent.trim() || sendingPrivate}
                  className={`px-4 py-2 rounded-lg font-medium disabled:opacity-50 ${variant === 'app' ? 'bg-app-purple text-white' : 'bg-fb-blue text-white'}`}
                >
                  {sendingPrivate ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    );
  }

  // Variant par défaut
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${depth > 0 ? 'ml-8 sm:ml-12 pl-4 border-l-2 border-fb-border' : ''}`}
    >
      <div className="flex gap-3 py-3">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
            isAdminComment ? 'bg-white border border-fb-border' : hasEmojiAvatar ? 'bg-fb-input-bg' : `text-sm font-semibold ${avatarColor}`
          }`}
        >
          {isAdminComment ? (
            <img src="/logo.png" alt="ChatAnonyme" className="w-full h-full object-cover" />
          ) : hasEmojiAvatar ? (
            <span className="text-lg">{comment.author_photo}</span>
          ) : (
            <span className="text-sm font-semibold">{initial}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-fb-text">{displayName}</span>
            {comment.author_type === 'admin' && (
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-fb-blue/20 text-fb-blue">
                Admin
              </span>
            )}
            <span className="text-xs text-fb-text-secondary">{formatDate(comment.created_at)}</span>
          </div>
          <p className="text-fb-text/90 text-sm mt-1 whitespace-pre-wrap">{decodeHtmlEntities(comment.content)}</p>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <button
              type="button"
              onClick={handleLike}
              className="flex items-center gap-1.5 text-xs text-fb-text-secondary hover:text-fb-blue transition-colors"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
            </button>
            {depth < maxDepth && (
              <button
                type="button"
                onClick={() => setShowReplyInput((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-fb-text-secondary hover:text-fb-blue transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Répondre
              </button>
            )}
            {canReplyPrivate && (
              <button
                type="button"
                onClick={() => setShowPrivateModal(true)}
                className="flex items-center gap-1.5 text-xs text-fb-blue hover:underline"
              >
                <Mail className="w-3.5 h-3.5" /> Répondre en privé
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete?.(comment.id)}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" /> Supprimer
              </button>
            )}
          </div>
        </div>
      </div>

      {showReplyInput && (
        <div className="ml-12 mb-3">
          <CommentInput
            placeholder="Écrire une réponse..."
            replyingTo={displayName}
            onSubmit={handleReply}
            onCancel={() => setShowReplyInput(false)}
          />
        </div>
      )}

      {replies.length > 0 && (
        <div className="mt-2 space-y-1">
          {replies.map((r) => (
            <Comment
              key={r.id}
              comment={r}
              replies={r.replies || []}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete}
              onReplyPrivate={onReplyPrivate}
              canDelete={canDelete}
              canReplyPrivate={canReplyPrivate}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}

      {/* Modal Répondre en privé (variant default) */}
      {showPrivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPrivateModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl p-4 w-full max-w-md border border-fb-border"
          >
            <h3 className="font-semibold text-fb-text mb-2">Répondre en privé</h3>
            <p className="text-sm text-fb-text-secondary mb-3">Votre message sera envoyé dans la conversation privée.</p>
            <textarea
              value={privateContent}
              onChange={(e) => setPrivateContent(e.target.value)}
              placeholder="Votre message..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-fb-input-bg border border-fb-border text-fb-text text-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setShowPrivateModal(false); setPrivateContent(''); }} className="px-4 py-2 rounded-lg text-fb-text-secondary hover:bg-fb-input-bg">Annuler</button>
              <button type="button" onClick={handleReplyPrivate} disabled={!privateContent.trim() || sendingPrivate} className="px-4 py-2 rounded-lg bg-fb-blue text-white disabled:opacity-50">{sendingPrivate ? 'Envoi...' : 'Envoyer'}</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
