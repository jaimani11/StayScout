# StayScout AI

> AI-native travel orchestration. Describe your trip in a sentence; specialized agents handle the rest.

## Status

**Slice A1 — Foundation & Design System** complete. The visual foundation is in (cinematic dark + boutique-light themes, Fraunces × Inter × Geist Mono typography, design tokens, theme toggle with no FOUC). Workspace, agents, and Trip Board come online in subsequent slices.

- Spec: [`docs/superpowers/specs/2026-05-08-stayscout-slice-a-design.md`](docs/superpowers/specs/2026-05-08-stayscout-slice-a-design.md)
- Plans: [`docs/superpowers/plans/`](docs/superpowers/plans/)

## Quick start

Requires Node 22+ and pnpm 9+ (or 10/11). pnpm via `corepack enable`.

```bash
pnpm install
pnpm dev          # → http://localhost:3000
```

## Scripts

```
pnpm dev            Start the dev server (Turbopack)
pnpm build          Production build
pnpm start          Run the production server
pnpm typecheck      Run TypeScript without emitting
pnpm lint           ESLint (boundaries + Next + TS)
pnpm format         Format with Prettier
pnpm format:check   Verify formatting (used in CI)
```

## Architecture: layered folders

The src tree is split into layers with strict ESLint-enforced boundaries. Adding a feature should never tempt anyone to break these.

```
src/
  core/           types & contracts only — no runtime, no React, no Next imports
  agents/         Agent implementations           ← deps: core, lib
  providers/      Provider implementations        ← deps: core, lib
  orchestrator/   Orchestrator + event stream    ← deps: core, agents, providers, lib
  lib/            model client, streaming, fonts, photos, session, quality,
                  curation, evaluation, theme    ← deps: core
  features/       UI features by domain          ← deps: anything except app
  app/            Next.js routes — thin glue     ← deps: anything
  styles/         design tokens, globals.css
```

Allowed import direction: `app → features → orchestrator → agents/providers → lib → core`.
The reverse fails CI (verified via `boundaries/dependencies` rule).

## Slice roadmap

| Slice | Status |
|---|---|
| A1 — Foundation & Design System | ✓ |
| A2 — Core Contracts | next |
| A3 — Mock Italy Provider + Curation Library | |
| A4 — ModelClient + IntentAgent | |
| A5 — Orchestrator + Streaming Protocol | |
| A6 — LLM-Synthesized Provider + MoodSnapshotAgent | |
| A7 — Workspace Shell + Chat Sidebar | |
| A8 — Trip Board Canvas (materialization) | |
| A9 — Refine Flow + Compare + Memory Hints + Detail View | |
| A10 — Marketing Sections + Mobile Fallback + Polish & Deploy | |
| B / C / D | (after A is shipped) |

## Conventions

- TDD where it makes sense (logic, parsers, agents, providers). Visual scaffolding gets manual verification.
- Single source of truth for UI state lives in Zustand (Slice A7+). No component-local state for non-ephemeral data.
- The Provider interface is sacred — every real-world inventory source must fit through it.
- Optional polish (mood snapshots, memory hints) must never block the critical path.
- Editorial voice: fragments and italics, never paragraphs and exclamations. No "discover", "unforgettable", "hidden gem", "journey".

## License

Proprietary — all rights reserved (placeholder until license decision).
