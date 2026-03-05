/**
 * Skeleton loader - États de chargement
 */

import { motion } from 'framer-motion';

export default function Skeleton({ className = '', width, height }) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`rounded-lg bg-white/10 ${className}`}
      style={{ width: width || '100%', height: height || '1rem' }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-corum-night/60 backdrop-blur-xl border border-white/10 p-6 space-y-4">
      <Skeleton height={24} width="60%" />
      <Skeleton height={16} />
      <Skeleton height={16} width="80%" />
      <Skeleton height={12} width="40%" />
    </div>
  );
}
