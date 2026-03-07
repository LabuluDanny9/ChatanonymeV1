/**
 * Panneau de signalements — Modération
 * Interface moderne type Discord/Reddit
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, CheckCircle, XCircle, UserX, ChevronRight } from 'lucide-react';

const severityConfig = {
  low: { label: 'Faible', color: 'bg-admin-success/20 text-admin-success border-admin-success/30' },
  medium: { label: 'Moyen', color: 'bg-admin-warning/20 text-admin-warning border-admin-warning/30' },
  high: { label: 'Élevé', color: 'bg-admin-danger/20 text-admin-danger border-admin-danger/30' },
};

export default function AdminReports() {
  const [reports] = useState([]); // Placeholder — à connecter à l'API

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-admin-text">Signalements</h1>
        <p className="text-admin-muted mt-1">Centre de modération et gestion des signalements</p>
      </motion.div>

      {/* Stats rapides */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'En attente', value: 0, icon: AlertTriangle, color: 'from-admin-warning/20 to-admin-warning/5' },
          { label: 'Traités', value: 0, icon: CheckCircle, color: 'from-admin-success/20 to-admin-success/5' },
          { label: 'Rejetés', value: 0, icon: XCircle, color: 'from-admin-muted/20 to-admin-muted/5' },
          { label: 'Comptes sanctionnés', value: 0, icon: UserX, color: 'from-admin-danger/20 to-admin-danger/5' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="p-5 rounded-2xl bg-admin-card/50 border border-admin-border backdrop-blur-sm"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <p className="text-2xl font-bold text-admin-text">{stat.value}</p>
            <p className="text-sm text-admin-muted">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Liste des signalements */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-admin-card/30 border border-admin-border overflow-hidden backdrop-blur-sm"
      >
        <div className="p-6 border-b border-admin-border">
          <h2 className="font-semibold text-admin-text flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-admin-purple" /> Signalements récents
          </h2>
          <p className="text-sm text-admin-muted mt-1">Aucun système de signalement configuré pour l'instant</p>
        </div>
        <div className="p-12 text-center">
          <ShieldAlert className="w-16 h-16 text-admin-muted/50 mx-auto mb-4" strokeWidth={1} />
          <p className="text-admin-muted">Aucun signalement pour le moment</p>
          <p className="text-sm text-admin-muted mt-2">Les signalements apparaîtront ici une fois le module activé</p>
        </div>
      </motion.div>
    </div>
  );
}
