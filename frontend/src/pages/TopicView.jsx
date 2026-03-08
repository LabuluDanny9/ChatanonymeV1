/**
 * Détail d'un sujet — Interface style Facebook
 * Post principal, réactions, commentaires intégrés
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ThumbsUp, MessageCircle, Share2, Globe } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Skeleton from '../components/ui/Skeleton';
import Comment from '../components/forum/Comment';
import CommentInput from '../components/forum/CommentInput';
import { getErrorMessage } from '../lib/api';
import { decodeHtmlEntities } from '../lib/textUtils';
import { SOCKET_API_URL, getSocketOptions } from '../lib/socketConfig';

function buildCommentTree(comments) {
  const byId = new Map();
  comments.forEach((c) => byId.set(c.id, { ...c, replies: [] }));
  const roots = [];
  comments.forEach((c) => {
    const node = byId.get(c.id);
    if (c.parent_id && byId.has(c.parent_id)) {
      byId.get(c.parent_id).replies.push(node);
    } else {
      roots.push(node);
    }
  });
  roots.forEach((r) => r.replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
  roots.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  return roots;
}

export default function TopicView() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, admin } = useAuth();
  const toast = useToast();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAdminView = location.pathname.startsWith('/admin/topics');
  const backTo = isAdminView ? '/admin/topics' : isDashboard ? '/dashboard/topics' : '/topics';

  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentError, setCommentError] = useState(null);
  const [authorName, setAuthorName] = useState('');
  const [postLiked, setPostLiked] = useState(false);

  const fetchTopic = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/topics/${id}`);
      setTopic(data);
      setError(null);
    } catch {
      setError('Sujet introuvable');
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/topics/${id}/comments`);
      setComments(data.comments || []);
    } catch {
      setComments([]);
    }
  }, [id]);

  useEffect(() => {
    Promise.all([fetchTopic(), fetchComments()]).finally(() => setLoading(false));
  }, [fetchTopic, fetchComments]);

  const handleAddComment = async (content, parentId = null) => {
    setCommentError(null);
    const body = { content, parentId };
    if (!user && !admin && authorName.trim()) body.author_name = authorName.trim();
    try {
      const { data } = await api.post(`/api/topics/${id}/comments`, body);
      setComments((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setCommentError(getErrorMessage(err, 'Impossible de publier le commentaire'));
      throw err;
    }
  };

  const handleReply = async (parentId, content) => {
    return handleAddComment(content, parentId);
  };

  const handleLikeComment = async (commentId) => {
    try {
      const { data } = await api.post(`/api/topics/${id}/comments/${commentId}/like`);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, likes_count: data.likes_count } : c))
      );
    } catch {
      // ignore
    }
  };

  const removeCommentFromTree = useCallback((commentId) => {
    setComments((prev) => {
      const toRemove = new Set([commentId]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const c of prev) {
          if (c.parent_id && toRemove.has(c.parent_id) && !toRemove.has(c.id)) {
            toRemove.add(c.id);
            changed = true;
          }
        }
      }
      return prev.filter((c) => !toRemove.has(c.id));
    });
  }, []);

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    try {
      await api.delete(`/api/topics/${id}/comments/${commentId}`);
      removeCommentFromTree(commentId);
      toast.success('Commentaire supprimé');
      fetchComments();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Impossible de supprimer'));
    }
  };

  const handleReplyPrivate = async (commentId, content) => {
    try {
      if (admin) {
        await api.post(`/api/admin/topics/comments/${commentId}/reply-private`, { content: String(content || '').trim() });
        toast.success('Message envoyé en privé');
      } else {
        await api.post(`/api/topics/${id}/comments/${commentId}/reply-private`, { content: String(content || '').trim() });
        toast.success('Message envoyé à l\'administrateur');
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Impossible d\'envoyer'));
      throw err;
    }
  };

  useEffect(() => {
    const token = api.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    if (!token || !id) return;
    const socket = io(SOCKET_API_URL, getSocketOptions(token));
    socket.emit('topic:join', id);
    socket.on('comment:deleted', (payload) => {
      if (payload.commentId) removeCommentFromTree(payload.commentId);
    });
    return () => {
      socket.emit('topic:leave', id);
      socket.disconnect();
    };
  }, [id, removeCommentFromTree]);

  const tree = buildCommentTree(comments);
  const commentCount = topic?.comments_count ?? comments.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg py-6">
        <div className="max-w-[680px] mx-auto px-4">
          <Skeleton height={24} width={120} className="mb-6 bg-app-surface" />
          <div className="bg-app-card/50 rounded-2xl p-6 space-y-4 border border-app-border">
            <Skeleton height={40} width={40} className="rounded-full" />
            <Skeleton height={24} className="w-3/4" />
            <Skeleton height={16} />
            <Skeleton height={16} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-app-muted mb-4">{error || 'Sujet introuvable'}</p>
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 text-app-purple hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux sujets
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text">
      <div className="bg-app-surface/80 backdrop-blur-sm border-b border-app-border sticky top-0 z-10">
        <div className="max-w-[680px] mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            to={backTo}
            className="p-2 -ml-2 rounded-xl hover:bg-app-card text-app-muted hover:text-app-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold text-app-text">Publication</span>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-4 py-6">
        <motion.article
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-app-card/50 rounded-2xl overflow-hidden border border-app-border"
        >
          <div className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-app-purple/20 border border-app-border flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="/logo.png" alt="ChatAnonyme" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-app-text">ChatAnonyme</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-app-purple/20 text-app-purple">
                  Admin
                </span>
              </div>
              <div className="flex items-center gap-1 text-app-muted text-[13px] mt-0.5">
                <span>{new Date(topic.published_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                <span>·</span>
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="px-4 pb-2">
            <h1 className="text-xl font-semibold text-app-text mb-2">{topic.title}</h1>
            <div className="text-app-text text-[15px] leading-relaxed whitespace-pre-wrap">
              {decodeHtmlEntities(topic.content)}
            </div>
          </div>

          <div className="px-4 py-2 flex items-center justify-between text-app-muted text-[13px] border-t border-app-border">
            <div className="flex items-center gap-4">
              {commentCount > 0 && (
                <button type="button" className="hover:underline">
                  {commentCount} commentaire{commentCount !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-app-border">
            <button
              type="button"
              onClick={() => setPostLiked((v) => !v)}
              className={`flex items-center justify-center gap-2 py-3 text-[15px] font-medium transition-colors ${
                postLiked ? 'text-app-purple' : 'text-app-muted hover:bg-app-surface/50'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${postLiked ? 'fill-current' : ''}`} />
              J'aime
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-3 text-app-muted hover:bg-app-surface/50 text-[15px] font-medium transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Commenter
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-3 text-app-muted hover:bg-app-surface/50 text-[15px] font-medium transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Partager
            </button>
          </div>

          <div className="border-t border-app-border bg-app-surface/30 p-4">
            {!user && !admin && (
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Votre nom (optionnel)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-app-card border border-app-border text-app-text text-[15px] placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-purple/50"
                />
              </div>
            )}

            {/* Champ commentaire — style Facebook (pill) */}
            <div className="mb-4">
              <CommentInput
                placeholder="Écrire un commentaire..."
                onSubmit={(content) => handleAddComment(content)}
                variant="app"
              />
            </div>

            {commentError && (
              <p className="text-sm text-red-500 mb-3">{commentError}</p>
            )}

            {/* Liste des commentaires */}
            <div className="space-y-1">
              {tree.map((c) => (
                <div key={c.id} className="bg-app-card/50 rounded-xl p-3 border border-app-border">
                  <Comment
                    comment={c}
                    replies={c.replies}
                    onReply={handleReply}
                    onLike={handleLikeComment}
                    onDelete={handleDeleteComment}
                    onReplyPrivate={handleReplyPrivate}
                    canDelete={
                      admin
                        ? true
                        : !!(user && c.author_type === 'user' && c.author_id === user.id)
                    }
                    canReplyPrivate={
                      admin
                        ? c.author_type === 'user' && c.author_id && c.author_id !== 'anonymous'
                        : !!(user && c.author_type === 'admin')
                    }
                    variant="app"
                  />
                </div>
              ))}
            </div>

            {tree.length === 0 && (
              <p className="text-center text-app-muted text-[13px] py-6">
                Aucun commentaire. Soyez le premier à réagir !
              </p>
            )}
          </div>
        </motion.article>

        {isDashboard && (
          <motion.button
            type="button"
            onClick={() => navigate('/dashboard/chat', { state: { topicId: topic.id, topicTitle: topic.title } })}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-app-purple to-app-blue text-white hover:opacity-90 font-medium text-[15px]"
          >
            Écrire à l'administrateur
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
