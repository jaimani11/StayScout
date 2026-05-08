import type { TripIntent } from '@core/trip-intent';
import type { TripProposal } from '@core/trip-proposal';
import type { ProposalRef } from '@core/partial';

export interface TurnRecord {
  turnId: string;
  sessionId: string;
  userId?: string;
  conversationId?: string;
  type: 'compose' | 'refine';
  rawInput: string;
  intent: TripIntent;
  proposal?: TripProposal;
  failed?: boolean;
  error?: string;
  durationMs?: number;
  completedAt: number;
}

export interface SavedTrip {
  id: string;
  ownerKind: 'user' | 'session';
  ownerId: string;
  conversationId?: string;
  proposalId: string;
  proposalSummary: ProposalRef['summary'];
  proposal: TripProposal;
  intent: TripIntent;
  bookmarkedAt: string;
}

export interface MigrationResult {
  movedUserId: string;
  fromSessionId: string;
  tripsCopied: number;
  alreadyMigrated: boolean;
}

export type OwnerKind = 'user' | 'session';

export interface SaveTripArgs {
  ownerKind: OwnerKind;
  ownerId: string;
  proposalId: string;
  proposalSummary: ProposalRef['summary'];
  proposal: TripProposal;
  intent: TripIntent;
  conversationId?: string;
}

export interface OwnerArgs {
  ownerKind: OwnerKind;
  ownerId: string;
}

/**
 * SessionStore — the persistence boundary for everything Slice B–D
 * stores per-user or per-session. Two implementations:
 *
 *   - InMemorySessionStore: always available; backs the "no DB" dev mode.
 *     Process-local; lost on restart. Saved trips survive page refreshes
 *     within a single dev-server session.
 *
 *   - PostgresSessionStore: active when DATABASE_URL is set. Backed by
 *     Prisma. Real durability + auth-aware queries.
 *
 * Both implementations pass the same contract tests. New persistence
 * concerns (affiliate clicks, memory records) extend this interface in
 * later sub-slices; the contract is intentionally narrow today.
 */
export interface SessionStore {
  // ============== Turns (orchestrator's refine lookup) ==============
  getTurn(turnId: string): Promise<TurnRecord | null>;
  putTurn(turn: TurnRecord): Promise<void>;

  // ============== Saved trips ==============
  saveTrip(args: SaveTripArgs): Promise<SavedTrip>;
  listTrips(args: OwnerArgs): Promise<SavedTrip[]>;
  getTrip(args: OwnerArgs & { tripId: string }): Promise<SavedTrip | null>;
  deleteTrip(args: OwnerArgs & { tripId: string }): Promise<boolean>;

  // ============== Migration ==============
  migrateAnonymousToUser(args: {
    fromSessionId: string;
    toUserId: string;
  }): Promise<MigrationResult>;
}
