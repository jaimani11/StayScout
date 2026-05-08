'use client';

import { Sparkle } from '@/features/shared/icons';
import { useWorkspaceStore } from '../store/workspace-store';
import { useConciergeStream } from '../hooks/use-concierge-stream';

const SUGGESTIONS = [
  'Tuscany, slow and walkable',
  'Tokyo for a long weekend',
  'Patagonia in shoulder season',
];

export function Greeting() {
  const setDraft = useWorkspaceStore((s) => s.setInputDraft);
  const { send } = useConciergeStream();

  return (
    <div className="px-5 pt-6 pb-4">
      <div
        className="mb-4 inline-flex items-center gap-2 text-[color:var(--ink-tertiary)]"
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: 'var(--text-label)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        <Sparkle size={11} style={{ color: 'var(--accent-primary)' }} />
        Concierge
      </div>
      <h1
        className="mb-5"
        style={{
          fontFamily: 'var(--font-fraunces)',
          fontSize: 'var(--text-display-sm)',
          fontWeight: 300,
          lineHeight: 1.15,
          letterSpacing: '-0.025em',
          color: 'var(--ink-primary)',
        }}
      >
        {greetingText()}
        <br />
        <em style={{ color: 'var(--accent-primary)', fontStyle: 'italic' }}>next?</em>
      </h1>
      <ul className="space-y-1.5">
        {SUGGESTIONS.map((s) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => {
                setDraft(s);
                void send({ rawInput: s });
              }}
              className="w-full rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-elevated)] px-3 py-2 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:border-[color:var(--border-emphasis)] hover:bg-[color:var(--surface-overlay)]"
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 'var(--text-body-sm)',
                color: 'var(--ink-secondary)',
              }}
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function greetingText(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Where to,';
  if (h < 12) return 'Good morning. Where to,';
  if (h < 18) return 'Good afternoon. Where to,';
  return 'Good evening. Where to,';
}
