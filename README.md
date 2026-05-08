# StayScout AI

> AI-native travel orchestration. Describe your trip in a sentence; specialized agents handle the rest.

## Status

**Slice A — Cinematic Foundation: complete.** Type a sentence, see a typed JSONL stream of agent steps, watch a Trip Board materialize. Pin to compare. Refine in plain English. Mood snapshots, memory hints, detail view, marketing scroll — all in.

- Spec: [`docs/superpowers/specs/2026-05-08-stayscout-slice-a-design.md`](docs/superpowers/specs/2026-05-08-stayscout-slice-a-design.md)
- Plans: [`docs/superpowers/plans/`](docs/superpowers/plans/)
- Tags: `slice-a1` … `slice-a10`

## Quick start

Requires Node 22+, pnpm 9+ (use `corepack enable` to install), and an Anthropic API key.

```bash
pnpm install
echo "ANTHROPIC_API_KEY=sk-..." >> .env.local
pnpm dev          # → http://localhost:3000
```

## Try the wire

`/api/concierge` returns a JSONL stream of typed `OrchestratorEvent`s. Curl it directly:

```bash
curl -N -X POST http://localhost:3000/api/concierge \
  -H 'Content-Type: application/json' \
  -d '{
    "sessionId": "anon_smoke",
    "turnId": "t_curl_1",
    "type": "compose",
    "input": { "rawInput": "Italy 7 days, family of 4, walkable, no tourist traps" },
    "clientCapabilities": {
      "supportsAdaptationDelta": true,
      "supportsMoodSnapshot": true,
      "supportsMemoryHint": true
    }
  }'
```

Expected event sequence: `session.started` → `turn.started` → `agent.step.*` (intent → search → mood) → `intent.extracted` → `provider.search.completed` → `proposal.shimmering` → `proposal.ready` → `proposal.bookmarkable` → `concierge.message` → `mood.snapshot.ready` → `turn.completed`.

## Scripts

```
pnpm dev            Start the dev server (Turbopack)
pnpm build          Production build
pnpm start          Run the production server
pnpm typecheck      Run TypeScript without emitting
pnpm lint           ESLint (boundaries + Next + TS)
pnpm format         Format with Prettier
pnpm format:check   Verify formatting (used in CI)
pnpm test           Run unit tests (skips integration)
pnpm test:live      Live-API integration tests (requires ANTHROPIC_API_KEY + RUN_LIVE_API_TESTS=1)
pnpm test:eval      IntentAgent golden cases against the live API (requires RUN_EVAL_TESTS=1)
```

## Architecture: layered folders

The `src` tree is split into layers with strict ESLint-enforced boundaries. Adding a feature should never tempt anyone to break these.

```
src/
  core/           types & contracts only — no runtime, no React, no Next imports
  agents/         IntentAgent + MoodSnapshotAgent     ← deps: core, lib
  providers/      MockItalyProvider + LLMSynthesizedProvider ← deps: core, lib
  orchestrator/   Orchestrator class + diff utilities + event stream
                                                       ← deps: core, agents, providers, lib
  lib/            ai (Anthropic client + prompts), streaming (JSONL),
                  observability (TraceLogger), session (cookie),
                  quality (taste lint), curation (moods/destinations/voice),
                  memory-hinter, theme, photos      ← deps: core
  features/       UI features (workspace, marketing, landing, shared)
                                                       ← deps: anything except app
  app/            Next.js routes — thin glue       ← deps: anything
  styles/         design tokens, globals.css
```

Allowed import direction: `app → features → orchestrator → agents/providers → lib → core`.
The reverse fails CI (verified via `boundaries/dependencies` rule).

## Slice roadmap

| Slice | Title | Status |
|---|---|---|
| A1 | Foundation & Design System | ✓ |
| A2 | Core Contracts (Zod-validated) | ✓ |
| A3 | MockItalyProvider + Curation Library + 30 stays | ✓ |
| A4 | AnthropicModelClient + IntentAgent + eval baseline | ✓ |
| A5 | Orchestrator + Streaming Protocol over JSONL | ✓ |
| A6 | LLMSynthesizedProvider + MoodSnapshotAgent | ✓ |
| A7 | Workspace shell + Chat sidebar + Canvas | ✓ |
| A8 | Trip Board cinematic materialization | ✓ |
| A9 | Refine + Compare + Memory + Detail | ✓ |
| A10 | Marketing + Mobile + Deploy | ✓ |
| **Slice B** | Postgres + Clerk + LangGraph + real Booking/Expedia/Vrbo + Langfuse + affiliate redirect + /destinations SEO + mobile bottom-sheet | next |
| Slice C | pgvector memory + MonitoringAgent + ItineraryAgent + Stripe + admin panel | |
| Slice D | BookingAgent (approval-gated → autonomous) | |

## Conventions

- TDD where it makes sense (logic, parsers, agents, providers). Visual components get manual verification + the existing pipeline gates.
- Single source of truth for UI state lives in Zustand. No component-local state for non-ephemeral data.
- The Provider interface is sacred — every real-world inventory source must fit through it.
- Optional polish (mood snapshots, memory hints) must never block the critical path.
- Editorial voice: fragments and italics, never paragraphs and exclamations. No "discover", "unforgettable", "hidden gem", "journey". Enforced by `src/lib/quality/taste-lint.ts` in CI.

## License

Proprietary — all rights reserved (placeholder until license decision).
