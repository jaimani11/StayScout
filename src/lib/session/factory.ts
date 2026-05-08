import { getDbClient } from '@lib/db';
import { InMemorySessionStore } from './in-memory-session-store';
import { PostgresSessionStore } from './postgres-session-store';
import type { SessionStore } from './session-store';

let _instance: SessionStore | null = null;

/**
 * Resolve the singleton SessionStore. PostgresSessionStore when
 * DATABASE_URL is set + Prisma client constructed successfully; otherwise
 * InMemorySessionStore. The decision is made once per process.
 */
export function getSessionStore(): SessionStore {
  if (_instance) return _instance;
  const db = getDbClient();
  _instance = db ? new PostgresSessionStore(db) : new InMemorySessionStore();
  return _instance;
}

// Test seam — replace the singleton between tests.
export function _setSessionStoreForTesting(store: SessionStore | null): void {
  _instance = store;
}
