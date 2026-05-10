# StayScout AI

> AI-native travel orchestration. Describe your trip in a sentence; specialized agents handle the rest.

## Status

**Slice A — Cinematic Foundation: complete.** Type a sentence, see a typed JSONL stream of agent steps, watch a Trip Board materialize. Pin to compare. Refine in plain English. Mood snapshots, memory hints, detail view, marketing scroll — all in.

**Slice B1 — Persistence + Auth: complete (mock-safe).** Saved trips persist via a `SessionStore` interface with two implementations: an in-memory store (default) and a Postgres-backed Prisma store (active when `DATABASE_URL` is set). Anonymous sessions own trips by sessionId; signing in (Clerk, when configured) migrates them to the user's id idempotently.

**Slice B2 — Orchestrator → LangGraph: complete (opt-in).** The hand-rolled orchestrator now has a LangGraph-driven peer behind `STAYSCOUT_ORCHESTRATOR=langgraph`. Same `run()` contract, same event stream — verified by a parity test that deep-equals event sequences from both engines. Mock-safe: `MemorySaver` checkpoint default, `PostgresSaver` when `DATABASE_URL` is set.

**Slice B3 — Saved trip resurfacing + share links: complete.** Saved trips become first-class — clicking one resurfaces the proposal on the canvas; sharing produces an unguessable `/t/[slug]` URL with a "Save to my StayScout" CTA so recipients can fork into their own bucket. Slug is lazy-minted on first share (~95 bits of entropy). The public read sanitizes owner-identifying fields and the original raw prompt at the SessionStore boundary, not the route handler.

**Slice B4 — Affiliate redirect + click attribution: complete.** "Continue to Booking" now hits `/api/go`, which validates the destination against a hostname allowlist (open-redirect prevention), records an `AffiliateClick` row, and 302s to the provider. Click writes never block the redirect — booking flow is sacred. Anonymous and authenticated owners both attribute correctly; new providers join by adding a hostname.

**Slice B5 — Real provider integrations (mock-safe): complete.** A `BaseAffiliateProvider` abstract class encapsulates HTTP + retry + cache + mapper boilerplate. Booking.com ships as the reference implementation — self-registers when `BOOKING_COM_AFFILIATE_ID` + `BOOKING_COM_API_KEY` are set, invisible otherwise. Availability-aware registry + `searchWithFanout` helper let multiple providers run in parallel; one provider's outage never stalls the others. Adding Expedia / Vrbo / Hotelbeds is the same pattern: declare endpoint + auth, write a mapper, slot into the registry.

**Slice B6 — Destination pages + mobile bottom-sheet: complete.** Static `/destinations` index + `/destinations/[slug]` pages with hero photo, mood, featured stays, Schema.org `TouristDestination` JSON-LD, Open Graph cards, and a sitemap. The mobile workspace now opens with a draggable bottom-sheet (peek/half/full snaps) instead of the stacked split layout — chat is always at hand without dominating the canvas.

**Slice B7 — Langfuse traces + cost/latency dashboard: complete.** The existing `TraceLogger` seam now feeds a stackable composite: an always-on in-memory ring buffer + a Langfuse exporter that activates when keys are set. A new `/admin` operator dashboard surfaces summary stats (turns, P50/P95, total cost, error rate), per-agent latency bars, and a recent-turns table. Mock-safe: no Langfuse keys = no Langfuse import.

**Slice B8 — Polish (B-series follow-ups): complete.** Four follow-ups paid down: `ModelClient.generateWithMeta` so IntentAgent reports cost; `/api/trips/[tripId]/resurface` primes the SessionStore so refining a resurfaced saved trip works; per-provider circuit breaker on `BaseAffiliateProvider` (3-state, configurable threshold + cooldown); Expedia reference provider mirroring Booking.com file-for-file — proves the B5 abstraction reuses cleanly.

**Slice C1 — pgvector memory (mock-safe in-memory + scaffold): complete.** Persistent semantic memory across sessions: `BagOfWordsEmbedding` + `InMemoryMemoryStore` + `MemoryRecorder` + `MemoryRetriever`. The IntentAgent's user prompt now carries a `<memory>` block when retrieval finds a relevant prior turn; the workspace's existing `concierge.memory.hint` event surfaces cross-session recall instead of just the in-session heuristic. Postgres+pgvector and Anthropic embeddings have schema + env-flag scaffolding; full impls land in C1.x.

**Slice C2 — MonitoringAgent (saved-trip watcher): complete.** Saved trips become living. The saved-trips panel surfaces a small badge per row when something material has changed ("↓ 7% since you saved it", "New top match"). On-demand pull model triggered from `/api/trips/list`; per-trip throttle (60s default); deterministic mock checker ships in C2 with `RealMonitoringChecker` deferred to C2.x.

**Slice C3 — ItineraryAgent (multi-day plans): complete.** Saved trips can be expanded into a 3-day plan at `/trips/[tripId]/itinerary`. Hand-curated 3-day itineraries for all 7 Italian destinations (~105 slots of authored editorial content); generic synthesized fallback for everywhere else. The saved-trips panel grows a "PLAN DAY-BY-DAY →" link per row. `ModelItineraryGenerator` (live model + Viator activity search) deferred to C3.x.

**Slice C4 — Stripe (premium tier): complete.** Real Stripe integration alongside a mock fallback. `BillingProvider` interface with `MockBillingProvider` (keyless dev: every authed user premium, anon free) and `StripeBillingProvider` (test or live mode, hosted Checkout, signature-verified webhook, idempotent on `event.id`, owner state synced via `checkout.session.completed` + `customer.subscription.{created,updated,deleted}`). Soft-gate on the synthesized-itinerary path — curated Italy stays free for everyone. Setup walkthrough: [`docs/billing.md`](docs/billing.md) (Stripe CLI recipe + documented end-to-end test flow with card `4242 4242 4242 4242`).

**Slice C5 — Admin panel extensions: complete.** `/admin` grew from a telemetry summary into a real operator console. Four new pages: `/admin/turns/[turnId]` (per-trace drill-in with agent timeline + tokens + cost), `/admin/clicks` (affiliate click feed, owner-linked), `/admin/users/[userId]` (per-owner aggregate: trips, memories, billing entitlement, recent turns), `/admin/memories` (memory index browser with similarity search). Single auth gate via `requireAdmin()`; shared `<AdminShell>` + nav. Dashboard now surfaces a billing card alongside the existing turn/latency/cost/error stats. Only additive interface methods on the stores (`listClicks`, `listForOwner`, `listAllOwners`).

**Slice D — BookingAgent (approval-gated): complete.** Mock-safe end-to-end booking flow. From a saved-trip row, "Book this →" opens a two-step modal: traveler form → draft review (dates, total, cancellation policy) → explicit "Confirm booking" → `/bookings/[bookingId]` with the confirmation. `BookingProvider` interface + `MockBookingProvider` (idempotent on user's confirm-click), `BookingStore` (in-memory, owner-scoped), `BookingAgent` (draft/confirm/cancel). Sibling admin page `/admin/bookings` shows the feed with owner links + status pills. Real provider booking + autonomous mode + card capture explicitly **deferred to D.x** (architecture seam in place via `STAYSCOUT_LIVE_BOOKING` flag + `autonomous` arg on the agent).

- Specs: [`docs/superpowers/specs/`](docs/superpowers/specs/)
- Plans: [`docs/superpowers/plans/`](docs/superpowers/plans/)
- Tags: `slice-a1` … `slice-a10`, `slice-b1` … `slice-b8`, `slice-c1` … `slice-c5`, `slice-d`

## Quick start

Requires Node 22+, pnpm 9+ (use `corepack enable` to install). **No API keys needed for local dev.**

```bash
pnpm install
pnpm dev          # → http://localhost:3000
```

Without env vars, the app runs in mock mode end-to-end: deterministic provider results, in-memory session store, anonymous auth. Add keys to upgrade subsystems individually.

## Modes

Every variable is optional. The matrix shows what each one turns on:

| Subsystem | Without keys (default) | With keys |
|---|---|---|
| **Models** | Mock IntentAgent fixtures, deterministic mood snapshots | `ANTHROPIC_API_KEY` → live Claude calls |
| **Providers** | `MockItalyProvider` (30 curated stays) + `LLMSynthesizedProvider` (mock) | `BOOKING_COM_AFFILIATE_ID` + `BOOKING_COM_API_KEY` → Booking.com on. `EXPEDIA_API_KEY` + `EXPEDIA_SHARED_SECRET` → Expedia on. Both register together; circuit breaker isolates per-provider failures. |
| **Database** | In-memory `SessionStore` — process-local, lost on restart | `DATABASE_URL` → Postgres via Prisma. Run `pnpm db:migrate` once. |
| **Auth** | Anonymous (cookie-bound `sessionId`) — saved trips work | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` → sign-in + auto-migration of anonymous trips |
| **Orchestrator** | Hand-rolled engine | `STAYSCOUT_ORCHESTRATOR=langgraph` → LangGraph engine (same event stream; checkpointer is `MemorySaver` unless `DATABASE_URL` is set, then `PostgresSaver`) |
| **Observability** | In-memory telemetry buffer (read at `/admin`) | `LANGFUSE_PUBLIC_KEY` + `LANGFUSE_SECRET_KEY` → durable trace export. `LANGFUSE_HOST` for self-hosted instances. |

Mixing is supported. Set just `DATABASE_URL` to persist trips without sign-in. Set just Clerk keys to enable auth without persistence (saved trips still work in-memory). Production needs all of them.

See [`.env.example`](./.env.example) for the full list.

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
pnpm db:generate    Generate the Prisma client (runs automatically post-install)
pnpm db:migrate     Apply pending migrations against DATABASE_URL (dev)
pnpm db:migrate:deploy  Apply migrations (prod-safe, no schema diff prompt)
pnpm db:studio      Open Prisma Studio against DATABASE_URL
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
                  observability (TraceLogger), session (cookie + SessionStore
                  interface, in-memory + Postgres impls), auth (AuthState +
                  AuthProvider, Clerk-aware), db (Prisma client factory),
                  env (clientFeatures + getServerFeatures runtime flags),
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
| B1 | Persistence (`SessionStore` interface + Postgres impl) + Auth (Clerk + anon-to-user migration) — mock-safe | ✓ |
| B2 | Orchestrator → LangGraph + Postgres checkpointer (opt-in via STAYSCOUT_ORCHESTRATOR) | ✓ |
| B3 | Saved trips resurfacing + share links | ✓ |
| B4 | Affiliate redirect router + click attribution | ✓ |
| B5 | Real provider integrations (Booking ref impl, framework for Expedia/Vrbo/Hotelbeds) | ✓ |
| B6 | `/destinations/[slug]` SEO + mobile bottom-sheet | ✓ |
| B7 | Langfuse traces + cost/latency dashboard | ✓ |
| B8 | Polish: ModelClient.generateWithMeta + resurface refine + circuit breaker + Expedia | ✓ |
| C1 | pgvector memory (mock-safe in-memory + scaffold for pgvector / Anthropic embeddings) | ✓ |
| C2 | MonitoringAgent (saved-trip change watcher) | ✓ |
| C3 | ItineraryAgent (multi-day plans) | ✓ |
| C4 | Stripe (premium tier) — real test-mode + mock fallback (`docs/billing.md`) | ✓ |
| C5 | Admin panel extensions — turns, clicks, users, memories | ✓ |
| D | BookingAgent (approval-gated; autonomous deferred to D.x) | ✓ |
| D.x | Real provider booking + autonomous mode + card capture | next |

## Conventions

- TDD where it makes sense (logic, parsers, agents, providers). Visual components get manual verification + the existing pipeline gates.
- Single source of truth for UI state lives in Zustand. No component-local state for non-ephemeral data.
- The Provider interface is sacred — every real-world inventory source must fit through it.
- Optional polish (mood snapshots, memory hints) must never block the critical path.
- Editorial voice: fragments and italics, never paragraphs and exclamations. No "discover", "unforgettable", "hidden gem", "journey". Enforced by `src/lib/quality/taste-lint.ts` in CI.

## License

Proprietary — all rights reserved (placeholder until license decision).
