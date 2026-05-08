'use client';

import { motion } from 'framer-motion';
import { X } from '@/features/shared/icons';
import type { SavedTripRow as SavedTripRowData } from '../hooks/use-saved-trips';

/**
 * Single row in the saved-trips panel. Two affordances:
 *  - Click anywhere on the row → emits onSelect (parent decides what to
 *    do; for B1 this is a no-op preview, B3 will resurface the trip).
 *  - X button → removes (with optimistic update at the hook layer).
 *
 * Visuals lean on the same card vocabulary as the canvas trip-board so
 * a saved trip feels like a snapshot of the moment it was bookmarked.
 */
export function SavedTripRow({
  trip,
  index,
  onRemove,
  removing,
}: {
  trip: SavedTripRowData;
  index: number;
  onRemove: () => void;
  removing: boolean;
}) {
  const summary = trip.proposalSummary;
  const bookmarked = new Date(trip.bookmarkedAt);
  const dateLabel = bookmarked.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.32, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-[14px] border p-4"
      style={{
        background: 'var(--surface-elevated)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: 'var(--text-label)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--ink-tertiary)',
            }}
          >
            {summary.destinationName} · {summary.nights} {summary.nights === 1 ? 'night' : 'nights'}
          </p>
          <h3
            className="mt-1 truncate"
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'var(--text-body-lg)',
              fontWeight: 400,
              color: 'var(--ink-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {summary.heroStayName}
          </h3>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          aria-label={`Remove ${summary.heroStayName}`}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border opacity-0 transition-all group-hover:opacity-100 hover:bg-[color:var(--surface-overlay)] focus:opacity-100 disabled:pointer-events-none disabled:opacity-30"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--ink-secondary)' }}
        >
          <X size={13} strokeWidth={1.8} />
        </button>
      </div>

      {trip.proposal.reasoning.totalCost ? (
        <p
          className="mt-2"
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'var(--text-body-sm)',
            color: 'var(--accent-primary)',
            letterSpacing: '-0.005em',
          }}
        >
          {trip.proposal.reasoning.totalCost.amount.toLocaleString()}{' '}
          {trip.proposal.reasoning.totalCost.currency} total
        </p>
      ) : null}

      <p
        className="mt-2"
        style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '0.625rem',
          letterSpacing: '0.04em',
          color: 'var(--ink-tertiary)',
        }}
      >
        Bookmarked {dateLabel}
      </p>
    </motion.li>
  );
}
