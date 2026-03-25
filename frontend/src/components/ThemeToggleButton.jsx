/**
 * Bouton compact — un clic pour basculer clair / sombre
 */

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggleButton({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-app-border bg-app-card/80 text-app-text shadow-sm backdrop-blur-sm transition-colors hover:border-app-purple/40 hover:bg-app-card hover:text-app-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-app-purple/50 ${className}`}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {isDark ? <Sun className="h-4 w-4" strokeWidth={2} /> : <Moon className="h-4 w-4" strokeWidth={2} />}
    </motion.button>
  );
}
