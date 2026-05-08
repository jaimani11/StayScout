import type { PrismaClient } from '@prisma/client';
import type {
  MigrationResult,
  OwnerArgs,
  SavedTrip,
  SaveTripArgs,
  SessionStore,
  TurnRecord,
} from './session-store';

/**
 * Postgres-backed SessionStore — active when DATABASE_URL is set. Uses
 * Prisma client for type-safe queries.
 *
 * Owner model: User.id is the canonical owner key for both authenticated
 * users (Clerk userId) and anonymous sessions ("anon_<uuid>"). For
 * anonymous owners we ensure-create the User row on first save with
 * isAnonymous=true. Migration moves trips from anon User to authenticated
 * User and stamps User.migratedFrom for audit.
 */
export class PostgresSessionStore implements SessionStore {
  constructor(private readonly db: PrismaClient) {}

  // ============== Turns ==============
  // Slice B1: turns are orchestrator-scoped + ephemeral. We don't persist
  // every turn to the DB yet — that's a Slice B2 concern when LangGraph's
  // checkpointer wants graph-state replay. For now, turn lookup falls
  // back to an in-memory map shared across this process.
  private readonly turnCache = new Map<string, TurnRecord>();

  async getTurn(turnId: string): Promise<TurnRecord | null> {
    return this.turnCache.get(turnId) ?? null;
  }

  async putTurn(turn: TurnRecord): Promise<void> {
    this.turnCache.set(turn.turnId, turn);
  }

  // ============== Trips ==============
  async saveTrip(args: SaveTripArgs): Promise<SavedTrip> {
    await this.ensureUser(args.ownerKind, args.ownerId);

    const row = await this.db.trip.upsert({
      where: {
        userId_proposalId: { userId: args.ownerId, proposalId: args.proposalId },
      },
      create: {
        userId: args.ownerId,
        proposalId: args.proposalId,
        proposalSummary: args.proposalSummary as never,
        proposal: args.proposal as never,
        intent: args.intent as never,
        ...(args.conversationId ? { conversationId: args.conversationId } : {}),
      },
      update: {},
    });

    return rowToSavedTrip(row, args.ownerKind);
  }

  async listTrips(args: OwnerArgs): Promise<SavedTrip[]> {
    const rows = await this.db.trip.findMany({
      where: { userId: args.ownerId },
      orderBy: { bookmarkedAt: 'desc' },
    });
    return rows.map((r) => rowToSavedTrip(r, args.ownerKind));
  }

  async getTrip(args: OwnerArgs & { tripId: string }): Promise<SavedTrip | null> {
    const row = await this.db.trip.findFirst({
      where: { id: args.tripId, userId: args.ownerId },
    });
    return row ? rowToSavedTrip(row, args.ownerKind) : null;
  }

  async deleteTrip(args: OwnerArgs & { tripId: string }): Promise<boolean> {
    const result = await this.db.trip.deleteMany({
      where: { id: args.tripId, userId: args.ownerId },
    });
    return result.count > 0;
  }

  // ============== Migration ==============
  async migrateAnonymousToUser(args: {
    fromSessionId: string;
    toUserId: string;
  }): Promise<MigrationResult> {
    // Already migrated? Check User.migratedFrom on the destination.
    const destUser = await this.db.user.findUnique({
      where: { id: args.toUserId },
    });
    if (destUser?.migratedFrom === args.fromSessionId) {
      return {
        movedUserId: args.toUserId,
        fromSessionId: args.fromSessionId,
        tripsCopied: 0,
        alreadyMigrated: true,
      };
    }

    return this.db.$transaction(async (tx) => {
      // Ensure both User rows exist.
      await tx.user.upsert({
        where: { id: args.toUserId },
        create: {
          id: args.toUserId,
          isAnonymous: false,
          migratedFrom: args.fromSessionId,
        },
        update: { migratedFrom: args.fromSessionId },
      });

      // Move trips. Use updateMany rather than copy so the trip ids stay
      // stable — any client cache (e.g. saved-trips panel) keeps working.
      // The @@unique([userId, proposalId]) constraint prevents collisions
      // — if the destination user already has the same proposalId, the
      // anon trip is dropped.
      const sourceTrips = await tx.trip.findMany({
        where: { userId: args.fromSessionId },
        select: { id: true, proposalId: true },
      });
      let copied = 0;
      for (const t of sourceTrips) {
        const collision = await tx.trip.findUnique({
          where: {
            userId_proposalId: { userId: args.toUserId, proposalId: t.proposalId },
          },
        });
        if (collision) {
          await tx.trip.delete({ where: { id: t.id } });
        } else {
          await tx.trip.update({
            where: { id: t.id },
            data: { userId: args.toUserId },
          });
          copied += 1;
        }
      }

      return {
        movedUserId: args.toUserId,
        fromSessionId: args.fromSessionId,
        tripsCopied: copied,
        alreadyMigrated: false,
      };
    });
  }

  // ============== Helpers ==============
  private async ensureUser(ownerKind: 'user' | 'session', ownerId: string): Promise<void> {
    await this.db.user.upsert({
      where: { id: ownerId },
      create: { id: ownerId, isAnonymous: ownerKind === 'session' },
      update: {},
    });
  }
}

function rowToSavedTrip(
  row: {
    id: string;
    userId: string;
    conversationId: string | null;
    proposalId: string;
    proposalSummary: unknown;
    proposal: unknown;
    intent: unknown;
    bookmarkedAt: Date;
  },
  ownerKind: 'user' | 'session',
): SavedTrip {
  return {
    id: row.id,
    ownerKind,
    ownerId: row.userId,
    ...(row.conversationId ? { conversationId: row.conversationId } : {}),
    proposalId: row.proposalId,
    proposalSummary: row.proposalSummary as SavedTrip['proposalSummary'],
    proposal: row.proposal as SavedTrip['proposal'],
    intent: row.intent as SavedTrip['intent'],
    bookmarkedAt: row.bookmarkedAt.toISOString(),
  };
}
