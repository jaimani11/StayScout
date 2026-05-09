import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerAuth } from '@lib/auth';
import { getServerFeatures } from '@lib/env';
import { getMemoryTelemetryStore, getTraceLogger } from '@lib/observability';
import { SummaryCard } from '@/features/admin/summary-card';
import { AgentLatencyChart } from '@/features/admin/agent-latency-chart';
import { TurnRow } from '@/features/admin/turn-row';

export const metadata: Metadata = {
  title: 'Admin · StayScout',
  description: 'Operator dashboard for traces, costs, and latency.',
};

export const dynamic = 'force-dynamic';

/**
 * Operator dashboard. Reads from the in-memory telemetry buffer
 * populated by the orchestrator's TraceLogger composite. Always shows
 * locally-captured data; Langfuse (when wired) holds the durable copy.
 *
 * Auth gate:
 *   - Auth on (Clerk)  → require an authenticated session, else /
 *   - Auth off         → open (keyless dev convenience)
 *   - STAYSCOUT_ADMIN_PUBLIC=1 → open in any mode (staging / preview)
 */
export default async function AdminPage() {
  const features = getServerFeatures();
  const adminPublic = process.env.STAYSCOUT_ADMIN_PUBLIC === '1';
  if (features.auth && !adminPublic) {
    const auth = await getServerAuth();
    if (auth.kind !== 'authenticated') redirect('/');
  }

  // Touch the trace logger so its singleton is constructed (idempotent).
  getTraceLogger();
  const store = getMemoryTelemetryStore();
  const summary = store.getSummary();
  const turns = store.getRecentTurns(40);

  const errorRate = summary.turns > 0 ? (summary.failed / summary.turns) * 100 : 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-14">
      <header className="mb-8 flex flex-col gap-1">
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 'var(--text-label)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ink-tertiary)',
          }}
        >
          Operator
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'var(--text-display-lg, 3rem)',
            fontWeight: 300,
            color: 'var(--ink-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          }}
        >
          Dashboard
        </h1>
        <p
          className="mt-1 max-w-xl"
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'var(--text-body-sm)',
            fontStyle: 'italic',
            color: 'var(--ink-tertiary)',
            lineHeight: 1.55,
          }}
        >
          Recent turns, agent latency, model cost. Process-local — restarts clear it.{' '}
          {features.langfuse ? 'Durable copy lives in Langfuse.' : null}
        </p>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard
          label="Turns"
          value={String(summary.turns)}
          caption={`${summary.completed} completed · ${summary.failed} failed`}
        />
        <SummaryCard
          label="P50 latency"
          value={summary.p50DurationMs ? `${summary.p50DurationMs}ms` : '—'}
          caption={summary.p95DurationMs ? `p95 ${summary.p95DurationMs}ms` : 'no completed turns'}
        />
        <SummaryCard
          label="Total cost"
          value={summary.totalCostUsd > 0 ? `$${summary.totalCostUsd.toFixed(4)}` : '$0'}
          caption={summary.totalCostUsd > 0 ? 'across recent turns' : 'no priced calls'}
          emphasized={summary.totalCostUsd > 0}
        />
        <SummaryCard
          label="Error rate"
          value={`${errorRate.toFixed(1)}%`}
          caption={summary.failed > 0 ? `${summary.failed} failed` : 'all clean'}
        />
      </section>

      <section className="mb-8">
        <h2
          className="mb-4"
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 'var(--text-label)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ink-tertiary)',
          }}
        >
          Agent latency
        </h2>
        <div
          className="rounded-[14px] border p-4"
          style={{
            background: 'var(--surface-elevated)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <AgentLatencyChart agentLatency={summary.agentLatency} />
        </div>
      </section>

      <section>
        <h2
          className="mb-4"
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 'var(--text-label)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ink-tertiary)',
          }}
        >
          Recent turns
        </h2>
        {turns.length === 0 ? (
          <p
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'var(--text-body-sm)',
              fontStyle: 'italic',
              color: 'var(--ink-tertiary)',
            }}
          >
            No turns yet — run a search to populate.
          </p>
        ) : (
          <div
            className="overflow-hidden rounded-[14px] border"
            style={{
              background: 'var(--surface-elevated)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <table className="w-full text-left">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    background: 'var(--surface-overlay)',
                  }}
                >
                  {(['Turn', 'Type', 'Session', 'Duration', 'Agents', 'Cost'] as const).map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`px-3 py-2 ${i >= 3 ? 'text-right' : ''}`}
                        style={{
                          fontFamily: 'var(--font-inter)',
                          fontSize: 'var(--text-label)',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: 'var(--ink-tertiary)',
                          fontWeight: 500,
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {turns.map((t) => (
                  <TurnRow key={t.turnId} turn={t} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
