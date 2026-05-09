import type { TurnRecord } from '@lib/observability';

interface TurnRowProps {
  turn: TurnRecord;
}

/**
 * Single recent-turn row. Shows turnId tail, type, status, duration,
 * agent count, and total cost (if any agent run reported one). Status
 * dot color-coded.
 */
export function TurnRow({ turn }: TurnRowProps) {
  const totalCost = turn.agentRuns.reduce((sum, r) => sum + (r.costUsd ?? 0), 0);
  const turnIdTail = turn.turnId.length > 12 ? `…${turn.turnId.slice(-10)}` : turn.turnId;
  const sessionTail = turn.sessionId.length > 14 ? `…${turn.sessionId.slice(-12)}` : turn.sessionId;
  const statusColor =
    turn.status === 'completed'
      ? 'var(--accent-primary)'
      : turn.status === 'failed'
        ? 'var(--accent-warning, #ff8e6b)'
        : 'var(--ink-tertiary)';

  return (
    <tr
      className="border-b transition-colors hover:bg-[color:var(--surface-overlay)]"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: statusColor }}
          />
          <code
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '0.7rem',
              color: 'var(--ink-primary)',
            }}
          >
            {turnIdTail}
          </code>
        </div>
      </td>
      <td
        className="px-3 py-2.5"
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: 'var(--text-body-sm)',
          color: 'var(--ink-secondary)',
        }}
      >
        {turn.type ?? '—'}
      </td>
      <td className="px-3 py-2.5">
        <code
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '0.7rem',
            color: 'var(--ink-tertiary)',
          }}
        >
          {sessionTail}
        </code>
      </td>
      <td
        className="px-3 py-2.5 text-right"
        style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '0.75rem',
          color: 'var(--ink-primary)',
        }}
      >
        {turn.durationMs ? `${turn.durationMs}ms` : '—'}
      </td>
      <td
        className="px-3 py-2.5 text-right"
        style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '0.75rem',
          color: 'var(--ink-tertiary)',
        }}
      >
        {turn.agentRuns.length}
      </td>
      <td
        className="px-3 py-2.5 text-right"
        style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '0.75rem',
          color: totalCost > 0 ? 'var(--accent-primary)' : 'var(--ink-tertiary)',
        }}
      >
        {totalCost > 0 ? `$${totalCost.toFixed(4)}` : '—'}
      </td>
    </tr>
  );
}
