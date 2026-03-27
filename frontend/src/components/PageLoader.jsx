/**
 * Fallback Suspense — léger (sans framer-motion) pour un premier rendu rapide sur mobile
 */
export default function PageLoader() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 px-4" role="status" aria-live="polite">
      <div
        className="w-9 h-9 rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-600 dark:border-t-blue-400 animate-spin"
        style={{ animationDuration: '0.65s' }}
      />
      <span className="text-sm text-slate-500 dark:text-slate-400">Chargement…</span>
    </div>
  );
}
