/**
 * Notifications Drawer — Style Discord/Reddit
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageCircle, FileText, Megaphone, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const typeIcons = {
  message: MessageCircle,
  topic: FileText,
  forum: FileText,
  broadcast: Megaphone,
  reply: MessageCircle,
};

export default function NotificationsDrawer({ open, onClose }) {
  const navigate = useNavigate();
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
            className="fixed inset-0 bg-black/60 z-50 lg:z-40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-app-surface border-l border-app-border z-50 flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-app-border">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-app-purple" strokeWidth={1.5} />
                <h3 className="font-semibold text-app-text">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-app-purple/20 text-app-purple text-xs">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-app-muted hover:text-app-text rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="mx-4 mt-2 text-sm text-app-purple hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-app-muted/50 mx-auto mb-4" strokeWidth={1} />
                  <p className="text-app-muted text-sm">Aucune notification</p>
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
                        n.read ? 'bg-app-card/30 border-app-border' : 'bg-app-purple/10 border-app-purple/30'
                      }`}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.linkTo) {
                          navigate(n.linkTo);
                          onClose();
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-app-purple/20 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-app-purple" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-app-text">{n.title}</p>
                          <p className="text-xs text-app-muted mt-0.5">{n.body}</p>
                          <p className="text-xs text-app-muted/70 mt-1">
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
