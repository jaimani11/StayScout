import type {
  MigrationResult,
  OwnerArgs,
  SavedTrip,
  SaveTripArgs,
  SessionStore,
  TurnRecord,
} from './session-store';

/**
 * In-memory SessionStore implementation. Always available; default when
 * DATABASE_URL is unset. State is process-local and lost on restart, but
 * survives page refreshes within a dev-server session — that's enough
 * for the demo flow to feel real.
 */
export class InMemorySessionStore implements SessionStore {
  private readonly turns = new Map<string, TurnRecord>();
  // ownerKey: `${ownerKind}:${ownerId}` → trip-id-keyed map
  private readonly tripsByOwner = new Map<string, Map<string, SavedTrip>>();

  // ============== Turns ==============
  async getTurn(turnId: string): Promise<TurnRecord | null> {
    return this.turns.get(turnId) ?? null;
  }

  async putTurn(turn: TurnRecord): Promise<void> {
    this.turns.set(turn.turnId, turn);
  }

  // ============== Trips ==============
  async saveTrip(args: SaveTripArgs): Promise<SavedTrip> {
    const ownerKey = ownerKeyOf(args);
    const bucket = this.tripsByOwner.get(ownerKey) ?? new Map<string, SavedTrip>();
    // Idempotency: if a trip already exists for (owner, proposalId),
    // return it instead of duplicating. Mirrors Postgres @@unique.
    for (const existing of bucket.values()) {
      if (existing.proposalId === args.proposalId) return existing;
    }
    const trip: SavedTrip = {
      id: `trip_${cryptoRandomId()}`,
      ownerKind: args.ownerKind,
      ownerId: args.ownerId,
      ...(args.conversationId ? { conversationId: args.conversationId } : {}),
      proposalId: args.proposalId,
      proposalSummary: args.proposalSummary,
      proposal: args.proposal,
      intent: args.intent,
      bookmarkedAt: new Date().toISOString(),
    };
    bucket.set(trip.id, trip);
    this.tripsByOwner.set(ownerKey, bucket);
    return trip;
  }

  async listTrips(args: OwnerArgs): Promise<SavedTrip[]> {
    const bucket = this.tripsByOwner.get(ownerKeyOf(args));
    if (!bucket) return [];
    return Array.from(bucket.values()).sort(
      (a, b) => Date.parse(b.bookmarkedAt) - Date.parse(a.bookmarkedAt),
    );
  }

  async getTrip(args: OwnerArgs & { tripId: string }): Promise<SavedTrip | null> {
    const bucket = this.tripsByOwner.get(ownerKeyOf(args));
    return bucket?.get(args.tripId) ?? null;
  }

  async deleteTrip(args: OwnerArgs & { tripId: string }): Promise<boolean> {
    const bucket = this.tripsByOwner.get(ownerKeyOf(args));
    if (!bucket) return false;
    return bucket.delete(args.tripId);
  }

  // ============== Migration ==============
  async migrateAnonymousToUser(args: {
    fromSessionId: string;
    toUserId: string;
  }): Promise<MigrationResult> {
    const fromKey = `session:${args.fromSessionId}`;
    const toKey = `user:${args.toUserId}`;
    const sourceBucket = this.tripsByOwner.get(fromKey);
    if (!sourceBucket || sourceBucket.size === 0) {
      return {
        movedUserId: args.toUserId,
        fromSessionId: args.fromSessionId,
        tripsCopied: 0,
        alreadyMigrated: false,
      };
    }
    const destBucket = this.tripsByOwner.get(toKey) ?? new Map<string, SavedTrip>();
    let copied = 0;
    for (const trip of sourceBucket.values()) {
      // De-dupe on proposalId — already-migrated trips don't get duplicated.
      let existsForDest = false;
      for (const existing of destBucket.values()) {
        if (existing.proposalId === trip.proposalId) {
          existsForDest = true;
          break;
        }
      }
      if (existsForDest) continue;
      const moved: SavedTrip = {
        ...trip,
        ownerKind: 'user',
        ownerId: args.toUserId,
      };
      destBucket.set(moved.id, moved);
      copied += 1;
    }
    this.tripsByOwner.set(toKey, destBucket);
    // Clear source bucket — anonymous record no longer has trips. We
    // keep the empty bucket for audit-style semantics in Postgres.
    sourceBucket.clear();
    return {
      movedUserId: args.toUserId,
      fromSessionId: args.fromSessionId,
      tripsCopied: copied,
      alreadyMigrated: false,
    };
  }

  /** Test helper — clears all in-memory state. */
  reset(): void {
    this.turns.clear();
    this.tripsByOwner.clear();
  }
}

function ownerKeyOf(args: OwnerArgs): string {
  return `${args.ownerKind}:${args.ownerId}`;
}

function cryptoRandomId(): string {
  // Edge runtime + Node both expose crypto.randomUUID
  return (
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}
