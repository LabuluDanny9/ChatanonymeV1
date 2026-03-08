/**
 * Toast notifications - Feedback utilisateur
 * Framer Motion, 300ms transitions
 */

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { toErrorDisplay } from '../../lib/api';

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: AlertCircle,
};

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.type] || icons.info;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="pointer-events-auto flex items-center gap-3 p-4 rounded-xl bg-corum-night/95 backdrop-blur-xl border border-white/10 shadow-lg"
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  t.type === 'success' ? 'text-green-400' : t.type === 'error' ? 'text-corum-red' : 'text-corum-turquoise'
                }`}
              />
              <p className="text-sm text-corum-offwhite flex-1">{typeof t.message === 'string' ? t.message : toErrorDisplay(t.message)}</p>
              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                className="p-1 rounded-lg text-corum-gray hover:text-corum-offwhite transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

