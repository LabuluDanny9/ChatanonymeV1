/**
 * Notifications Drawer — Slide-in
 * Nouveau message, nouveau sujet, réponse admin
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MessageCircle, FileText, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const typeIcons = {
  message: MessageCircle,
  topic: FileText,
  reply: MessageCircle,
};

export default function NotificationsDrawer({ open, onClose }) {
  const { notifications, markAsRead, markAllRead, unreadCount } = useNotifications();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 lg:z-40"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-corum-night border-l border-white/10 z-50 flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-corum-turquoise" strokeWidth={1.5} />
                <h3 className="font-semibold text-corum-offwhite">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-corum-turquoise/20 text-corum-turquoise text-xs">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-corum-gray hover:text-corum-offwhite rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="mx-4 mt-2 text-sm text-corum-turquoise hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-corum-gray/50 mx-auto mb-4" strokeWidth={1} />
                  <p className="text-corum-gray text-sm">Aucune notification</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = typeIcons[n.type] || Bell;
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                        n.read ? 'bg-white/5 border-white/5' : 'bg-corum-turquoise/5 border-corum-turquoise/20'
                      }`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-corum-turquoise/20 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-corum-turquoise" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-corum-offwhite">{n.title}</p>
                          <p className="text-xs text-corum-gray mt-0.5">{n.body}</p>
                          <p className="text-xs text-corum-gray/70 mt-1">
                            {n.createdAt ? new Date(n.createdAt).toLocaleString('fr-FR') : ''}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
