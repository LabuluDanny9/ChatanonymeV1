/**
 * Espace utilisateur - Chat, sujets, broadcasts, WhatsApp
 * Design system
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { MessageCircle, Megaphone, FileText, ExternalLink } from 'lucide-react';
import api from '../lib/api';
import { decodeHtmlEntities } from '../lib/textUtils';
import { useAuth } from '../context/AuthContext';
import DashboardChat from './dashboard/DashboardChat';

import { SOCKET_API_URL, getSocketOptions, WS_ENABLED } from '../lib/socketConfig';

const DEFAULT_FEATURES = {
  forum: true,
  privateChat: true,
  userToUserChat: false,
  broadcasts: true,
  registrations: true,
};

const tabs = [
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'broadcasts', label: 'Messages collectifs', icon: Megaphone },
  { id: 'topics', label: 'Sujets', icon: FileText },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [config, setConfig] = useState({ whatsappNumber: '', features: DEFAULT_FEATURES });
  const [topics, setTopics] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    api
      .get('/api/config')
      .then(({ data }) =>
        setConfig({
          whatsappNumber: data.whatsappNumber || '',
          features: { ...DEFAULT_FEATURES, ...(data.features || {}) },
        })
      )
      .catch(() => {});
  }, []);

  const features = config.features || DEFAULT_FEATURES;

  useEffect(() => {
    if (!features.forum) {
      setTopics([]);
      return;
    }
    api.get('/api/topics', { params: { limit: 5 } }).then(({ data }) => setTopics(data.topics || [])).catch(() => {});
  }, [features.forum]);

  useEffect(() => {
    if (!features.broadcasts) {
      setBroadcasts([]);
      return;
    }
    api.get('/api/broadcasts', { params: { limit: 10 } }).then(({ data }) => setBroadcasts(data.broadcasts || [])).catch(() => {});
  }, [features.broadcasts]);

  const visibleTabs = useMemo(
    () =>
      tabs.filter((t) => {
        if (t.id === 'chat') return features.privateChat !== false;
        if (t.id === 'broadcasts') return features.broadcasts !== false;
        if (t.id === 'topics') return features.forum !== false;
        return true;
      }),
    [features.forum, features.privateChat, features.broadcasts]
  );

  useEffect(() => {
    if (!visibleTabs.length) return;
    setActiveTab((prev) => (visibleTabs.some((t) => t.id === prev) ? prev : visibleTabs[0].id));
  }, [visibleTabs]);

  useEffect(() => {
    if (!WS_ENABLED) return;
    const token = api.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    if (!token) return;
    const socket = io(SOCKET_API_URL, getSocketOptions(token));
    socket.on('broadcast:new', (b) => setBroadcasts((prev) => [b, ...prev]));
    return () => socket.disconnect();
  }, []);

  const whatsappUrl = config.whatsappNumber
    ? `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Bonjour, j\'aimerais vous contacter via ChatAnonyme.')}`
    : null;

  return (
    <div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-h2 font-bold text-[#E5E7EB] mb-2"
      >
        Mon espace — {user?.pseudo}
      </motion.h2>
      <p className="text-muted text-sm mb-8">Chat, sujets et messages collectifs</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {visibleTabs.map((tab) => (
          <motion.button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'glass text-muted hover:text-[#E5E7EB]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {activeTab === 'chat' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-success/20 text-success hover:bg-success/30 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Contacter l'admin sur WhatsApp
            </a>
          )}
          <DashboardChat />
        </motion.div>
      )}

      {activeTab === 'broadcasts' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {broadcasts.length === 0 ? (
            <p className="text-muted py-12">Aucun message collectif.</p>
          ) : (
            broadcasts.map((b) => (
              <div key={b.id} className="glass-card p-6">
                <p className="text-sm text-muted mb-2">{new Date(b.created_at).toLocaleString('fr-FR')}</p>
                <p className="text-[#E5E7EB] whitespace-pre-wrap">{decodeHtmlEntities(b.content || '')}</p>
              </div>
            ))
          )}
        </motion.div>
      )}

      {activeTab === 'topics' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {topics.map((t) => (
            <Link key={t.id} to={`/topics/${t.id}`}>
              <div className="glass-card p-4 h-full hover:border-primary/30 transition-all">
                <h3 className="font-medium text-[#E5E7EB]">{t.title}</h3>
                <p className="text-sm text-muted mt-1">{new Date(t.published_at).toLocaleDateString('fr-FR')}</p>
              </div>
            </Link>
          ))}
          <Link to="/topics" className="text-accent hover:underline text-sm flex items-center gap-1">
            Voir tous les sujets →
          </Link>
        </motion.div>
      )}
    </div>
  );
}
