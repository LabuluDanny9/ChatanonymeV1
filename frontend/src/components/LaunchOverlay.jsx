/**
 * Animation de lancement (Capacitor Android/iOS) + masquage du splash natif.
 */

import { useLayoutEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

const OVERLAY_MS_DEFAULT = 1650;
const OVERLAY_MS_FAST = 420;

export default function LaunchOverlay() {
  const [visible, setVisible] = useState(() => Capacitor.isNativePlatform());

  useLayoutEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;

    const reduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const overlayMs = reduced ? OVERLAY_MS_FAST : OVERLAY_MS_DEFAULT;

    let cancelled = false;
    let innerRaf = 0;

    const hideNative = async () => {
      try {
        await SplashScreen.hide({ fadeOutDuration: reduced ? 120 : 220 });
      } catch {
        /* plugin absent ou web */
      }
    };

    const outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => {
        if (!cancelled) void hideNative();
      });
    });

    const t = window.setTimeout(() => {
      if (!cancelled) setVisible(false);
    }, overlayMs);

    return () => {
      cancelled = true;
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(innerRaf);
      clearTimeout(t);
    };
  }, []);

  if (!Capacitor.isNativePlatform()) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="launch-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2147483646,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            background: 'linear-gradient(165deg, #1e40af 0%, #2563eb 42%, #0ea5e9 100%)',
          }}
        >
          <motion.img
            src={`${process.env.PUBLIC_URL || ''}/logo.png`}
            alt=""
            aria-hidden
            initial={{ scale: 0.94, opacity: 0.85 }}
            animate={
              typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? { scale: 1, opacity: 1 }
                : { scale: [0.82, 1.06, 1], opacity: 1 }
            }
            transition={
              typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? { duration: 0.2 }
                : { duration: 1.15, ease: [0.22, 1, 0.36, 1] }
            }
            style={{
              width: 'min(44vw, 200px)',
              height: 'auto',
              borderRadius: 22,
              boxShadow: '0 24px 48px rgba(0,0,0,0.22)',
            }}
          />
          {typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && (
            <motion.div
              aria-hidden
              style={{
                marginTop: 28,
                width: 36,
                height: 36,
                border: '3px solid rgba(255,255,255,0.35)',
                borderTopColor: 'rgba(255,255,255,0.95)',
                borderRadius: '50%',
              }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.85, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
