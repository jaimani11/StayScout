import { Sparkle } from '@/features/shared/icons';

export function WorkspaceShellPlaceholder() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <div
          className="mb-6 inline-flex items-center gap-2"
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 'var(--text-label)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ink-tertiary)',
          }}
        >
          <Sparkle size={12} style={{ color: 'var(--accent-primary)' }} />
          Foundation · Slice A1
        </div>

        <h1
          className="mb-6"
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'var(--text-display-lg)',
            fontWeight: 300,
            lineHeight: 1.0,
            letterSpacing: '-0.035em',
            color: 'var(--ink-primary)',
          }}
        >
          Your next stay,
          <br />
          <em
            style={{
              fontStyle: 'italic',
              fontWeight: 300,
              color: 'var(--accent-primary)',
            }}
          >
            intelligently found.
          </em>
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 'var(--text-body)',
            lineHeight: 1.55,
            color: 'var(--ink-secondary)',
          }}
        >
          The visual foundation is in. Workspace, agents, and Trip Board come
          online in subsequent slices.
        </p>
      </div>
    </main>
  );
}
