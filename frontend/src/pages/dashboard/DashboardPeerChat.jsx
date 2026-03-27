/**
 * Messagerie entre utilisateurs (activée par l’administrateur)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Send, Search, MessageCircle, ChevronLeft } from 'lucide-react';
import api, { getErrorMessage } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPeerChat() {
  const { user } = useAuth();
  const toast = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [searchHits, setSearchHits] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const listRef = useRef(null);
  const bottomRef = useRef(null);

  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      const { data } = await api.get('/api/peers/conversations');
      setConversations(data.conversations || []);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Impossible de charger les conversations'));
    } finally {
      setLoadingList(false);
    }
  }, [toast]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const q = searchQ.trim();
    if (q.length < 2) {
      setSearchHits([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get('/api/peers/discover', { params: { q } });
        setSearchHits(data.users || []);
      } catch {
        setSearchHits([]);
      } finally {
        setSearching(false);
      }
    }, 320);
    return () => clearTimeout(t);
  }, [searchQ]);

  const openWithUser = async (pseudo) => {
    try {
      const { data } = await api.post('/api/peers/open', { pseudo });
      setSearchQ('');
      setSearchHits([]);
      setSelectedId(data.conversation.id);
      setOtherUser(data.conversation.otherUser);
      setMessages([]);
      setMobileShowThread(true);
      await loadConversations();
      const msgRes = await api.get(`/api/peers/conversations/${data.conversation.id}/messages`);
      setMessages(msgRes.data.messages || []);
      setOtherUser(msgRes.data.conversation?.otherUser || data.conversation.otherUser);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Ouverture impossible'));
    }
  };

  const selectConversation = async (id) => {
    setSelectedId(id);
    setLoadingMsg(true);
    setMobileShowThread(true);
    try {
      const { data } = await api.get(`/api/peers/conversations/${id}/messages`);
      setMessages(data.messages || []);
      setOtherUser(data.conversation?.otherUser || null);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Chargement impossible'));
    } finally {
      setLoadingMsg(false);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !selectedId || sending) return;
    setSending(true);
    setInput('');
    try {
      const { data } = await api.post(`/api/peers/conversations/${selectedId}/messages`, { content: text });
      setMessages((prev) => [...prev, data]);
      loadConversations();
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      toast.error(getErrorMessage(e, 'Envoi impossible'));
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selectedId]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[70vh] lg:min-h-[calc(100dvh-8rem)]">
      {/* Liste + recherche */}
      <div
        className={`lg:w-[340px] flex flex-col rounded-2xl border border-app-border bg-app-surface/80 overflow-hidden ${
          mobileShowThread ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-app-border">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-app-purple" />
            <h2 className="font-semibold text-app-text">Entre utilisateurs</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted" />
            <input
              type="search"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Rechercher un pseudo (2+ car.)"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-app-card border border-app-border text-app-text text-sm placeholder:text-app-muted focus:outline-none focus:ring-2 focus:ring-app-purple/30"
            />
          </div>
          <AnimatePresence>
            {searchHits.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-app-border bg-app-card divide-y divide-app-border"
              >
                {searchHits.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => openWithUser(u.pseudo)}
                      className="w-full text-left px-3 py-2 text-sm text-app-text hover:bg-app-purple/10 flex items-center justify-between"
                    >
                      <span>{u.pseudo}</span>
                      {u.photo && u.photo.length <= 4 ? <span>{u.photo}</span> : null}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
          {searching && <p className="text-xs text-app-muted mt-1">Recherche…</p>}
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto">
          {loadingList ? (
            <p className="p-4 text-sm text-app-muted">Chargement…</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-app-muted">Aucune conversation. Recherchez un pseudo pour démarrer.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectConversation(c.id)}
                className={`w-full text-left px-4 py-3 border-b border-app-border/60 hover:bg-app-card/80 transition-colors ${
                  selectedId === c.id ? 'bg-app-purple/15 border-l-4 border-l-app-purple' : ''
                }`}
              >
                <div className="font-medium text-app-text">{c.otherUser?.pseudo}</div>
                {c.lastMessage && (
                  <div className="text-xs text-app-muted truncate mt-0.5">{c.lastMessage.content}</div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Fil de discussion */}
      <div
        className={`flex-1 flex flex-col rounded-2xl border border-app-border bg-app-surface/80 overflow-hidden min-h-[420px] ${
          !mobileShowThread ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-app-border bg-app-card/50">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-app-border/40"
            onClick={() => setMobileShowThread(false)}
            aria-label="Retour"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {otherUser ? (
            <>
              <div className="w-9 h-9 rounded-xl bg-app-purple/20 flex items-center justify-center text-lg">
                {otherUser.photo && otherUser.photo.length <= 4 ? otherUser.photo : <MessageCircle className="w-5 h-5 text-app-purple" />}
              </div>
              <div>
                <div className="font-semibold text-app-text">{otherUser.pseudo}</div>
                <div className="text-xs text-app-muted">Discussion privée</div>
              </div>
            </>
          ) : (
            <p className="text-app-muted text-sm">Sélectionnez une conversation ou recherchez un utilisateur</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loadingMsg && (
            <p className="text-sm text-app-muted text-center">Chargement des messages…</p>
          )}
          {!loadingMsg &&
            messages.map((m) => {
              const mine = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      mine ? 'bg-app-purple text-white rounded-br-md' : 'bg-app-card border border-app-border text-app-text rounded-bl-md'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t border-app-border bg-app-card/50 pb-safe">
          <div className="flex gap-2 items-end">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={!selectedId || sending}
              placeholder={selectedId ? 'Écrire un message…' : 'Choisissez une conversation'}
              className="flex-1 resize-none rounded-xl bg-app-bg border border-app-border px-4 py-3 text-app-text text-sm placeholder:text-app-muted focus:outline-none focus:ring-2 focus:ring-app-purple/30 min-h-[48px] max-h-32"
            />
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              disabled={!selectedId || sending || !input.trim()}
              onClick={send}
              className="shrink-0 w-12 h-12 rounded-xl bg-app-purple text-white flex items-center justify-center disabled:opacity-40"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
