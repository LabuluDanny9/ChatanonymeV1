import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, RefreshCw } from 'lucide-react';
import api, { getErrorMessage, ensureAuthToken } from '../../lib/api';

export default function AdminMessageHistory() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [senderType, setSenderType] = useState('');
  const [page, setPage] = useState(0);
  const limit = 30;

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      ensureAuthToken('admin');
      const { data } = await api.get('/api/admin/messages/history', {
        params: {
          limit,
          offset: page * limit,
          q: q.trim() || undefined,
          senderType: senderType || undefined,
        },
      });
      setRows(data.messages || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger l’historique'));
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, senderType]);

  const canPrev = page > 0;
  const canNext = (page + 1) * limit < total;

  const rangeLabel = useMemo(() => {
    if (!total) return '0 resultat';
    const start = page * limit + 1;
    const end = Math.min((page + 1) * limit, total);
    return `${start}-${end} / ${total}`;
  }, [page, total]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-admin-text">Historique global des messages</h1>
        <p className="text-admin-muted text-sm mt-1">
          Vue centralisee des messages utilisateurs/admin (conversation unidirectionnelle).
        </p>
      </motion.div>

      <div className="rounded-2xl bg-admin-card/40 border border-admin-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 text-admin-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(0);
                  fetchHistory();
                }
              }}
              placeholder="Rechercher par pseudo, contenu, type..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-admin-surface border border-admin-border text-admin-text placeholder-admin-muted focus:outline-none focus:border-admin-purple/50"
            />
          </div>
          <div className="md:col-span-3 relative">
            <Filter className="w-4 h-4 text-admin-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={senderType}
              onChange={(e) => {
                setSenderType(e.target.value);
                setPage(0);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-admin-surface border border-admin-border text-admin-text focus:outline-none focus:border-admin-purple/50"
            >
              <option value="">Tous expéditeurs</option>
              <option value="user">Utilisateurs</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => {
                setPage(0);
                fetchHistory();
              }}
              className="w-full h-full min-h-[40px] rounded-xl bg-admin-purple/20 border border-admin-purple/30 text-admin-purple hover:bg-admin-purple/30 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Filtrer
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-admin-danger/30 bg-admin-danger/10 text-admin-danger text-sm">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-admin-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-admin-surface/80 text-admin-muted">
              <tr>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Pseudo</th>
                <th className="text-left p-3">Expéditeur</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Contenu</th>
                <th className="text-left p-3">Conversation</th>
              </tr>
            </thead>
            <tbody className="bg-admin-card/20">
              {loading ? (
                <tr>
                  <td className="p-4 text-admin-muted" colSpan={6}>Chargement...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="p-4 text-admin-muted" colSpan={6}>Aucun message trouvé.</td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-admin-border/60">
                    <td className="p-3 text-admin-muted">
                      {r.created_at ? new Date(r.created_at).toLocaleString('fr-FR') : '—'}
                    </td>
                    <td className="p-3 text-admin-text">{r.pseudo || 'Anonyme'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${r.sender_type === 'admin' ? 'bg-admin-purple/20 text-admin-purple' : 'bg-admin-blue/20 text-admin-blue'}`}>
                        {r.sender_type === 'admin' ? 'admin' : 'user'}
                      </span>
                    </td>
                    <td className="p-3 text-admin-muted">{r.message_type || 'text'}</td>
                    <td className="p-3 text-admin-text max-w-[420px] truncate" title={r.content || ''}>
                      {r.content || '[piece jointe]'}
                    </td>
                    <td className="p-3 text-admin-muted font-mono text-xs">{r.conversation_id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-admin-muted">{rangeLabel}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-3 py-2 rounded-xl border border-admin-border text-admin-text disabled:opacity-40"
          >
            Précédent
          </button>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 rounded-xl border border-admin-border text-admin-text disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}

