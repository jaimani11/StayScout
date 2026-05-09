import { BagOfWordsEmbedding, type EmbeddingProvider } from './embedding';
import { InMemoryMemoryStore } from './in-memory-memory-store';
import type { MemoryStore } from './memory-store';
import { MemoryRecorder } from './recorder';
import { MemoryRetriever } from './retriever';

/**
 * Builds the memory subsystem.
 *
 *   - Embedding provider: BagOfWordsEmbedding by default (zero-cost,
 *     deterministic). Anthropic embeddings opt-in via
 *     STAYSCOUT_USE_ANTHROPIC_EMBEDDINGS=1 + ANTHROPIC_API_KEY (lands
 *     in C1 Task 7).
 *   - Memory store: InMemoryMemoryStore by default. Postgres+pgvector
 *     when DATABASE_URL is set + STAYSCOUT_PGVECTOR=1 (lands in C1
 *     Task 6).
 *
 * Cached per-process so the same retriever / recorder pair is shared
 * across the orchestrator + future admin views.
 */

export interface MemorySubsystem {
  store: MemoryStore;
  recorder: MemoryRecorder;
  retriever: MemoryRetriever;
  embedding: EmbeddingProvider;
  /** What backs the store + embedding provider. Surfaced via
   *  `getServerFeatures().memory` for the admin dashboard. */
  kind: 'in-memory' | 'pgvector';
  embeddingKind: 'bag-of-words' | 'anthropic';
}

let _cached: MemorySubsystem | null = null;

export function getMemorySubsystem(): MemorySubsystem {
  if (_cached) return _cached;
  const embedding = new BagOfWordsEmbedding(256);
  const store: MemoryStore = new InMemoryMemoryStore(embedding);
  const recorder = new MemoryRecorder(store);
  const retriever = new MemoryRetriever(store);
  _cached = {
    store,
    recorder,
    retriever,
    embedding,
    kind: 'in-memory',
    embeddingKind: 'bag-of-words',
  };
  return _cached;
}

/** Test-only — drop the cached subsystem. */
export function _resetMemorySubsystemForTesting(): void {
  _cached = null;
}
