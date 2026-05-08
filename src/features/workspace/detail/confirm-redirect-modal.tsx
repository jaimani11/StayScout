'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import type { Stay } from '@core/stay';
import { useReducedMotion } from '@/features/shared/motion/reduced-motion';

/**
 * Slice A booking placeholder. The actual affiliate redirect ships in
 * Slice B alongside the click-attribution route handler.
 */
export function ConfirmRedirectModal({
  open,
  onClose,
  stay,
}: {
  open: boolean;
  onClose: () => void;
  stay: Stay;
}) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="confirm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.25 }}
          className="fixed inset-0 z-50 grid place-items-center px-6"
          style={{ background: 'rgba(11, 13, 16, 0.78)' }}
          onClick={onClose}
        >
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: reduced ? 0.2 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md rounded-[18px] border p-5"
            style={{
              background: 'var(--surface-raised)',
              borderColor: 'var(--border-emphasis)',
              boxShadow: 'var(--elev-hero)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 'var(--text-label)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--accent-primary)',
              }}
            >
              Slice A demo
            </p>
            <h3
              className="mt-1 mb-2"
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 'var(--text-display-sm)',
                fontWeight: 400,
                color: 'var(--ink-primary)',
              }}
            >
              Booking redirect lives in Slice B.
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 'var(--text-body-sm)',
                fontStyle: 'italic',
                color: 'var(--ink-secondary)',
                lineHeight: 1.5,
              }}
            >
              {stay.name} would redirect to its provider with affiliate-tracked attribution. The
              click-attribution route handler ships in the next slice.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-full px-4 py-2"
              style={{
                background: 'var(--accent-primary)',
                color: '#14171C',
                fontFamily: 'var(--font-inter)',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 500,
              }}
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
