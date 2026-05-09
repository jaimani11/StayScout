import { clientFeatures } from './features';

/**
 * Server-side runtime feature flags. Reads from process.env at the time
 * of call (not at module load) so tests that set env vars dynamically
 * see the latest values.
 */
export interface ServerFeatures {
  auth: boolean;
  database: boolean;
  anthropic: boolean;
  langfuse: boolean;
  /** Which orchestrator engine the singleton would construct right now. */
  orchestratorEngine: 'hand-rolled' | 'langgraph';
  /** Real (env-keyed) provider availability. Mock providers are always on. */
  providers: {
    bookingCom: boolean;
    expedia: boolean;
  };
}

function isPresent(name: string): boolean {
  const v = process.env[name];
  // Treat empty AND the placeholder URL we use for `prisma generate` as
  // "not configured" — placeholder lets codegen run without forcing every
  // dev to set up Postgres locally.
  if (typeof v !== 'string' || v.length === 0) return false;
  if (v.includes('placeholder@localhost') || v === 'placeholder') return false;
  return true;
}

export function getServerFeatures(): ServerFeatures {
  return {
    auth: clientFeatures.auth && isPresent('CLERK_SECRET_KEY'),
    database: isPresent('DATABASE_URL'),
    anthropic: isPresent('ANTHROPIC_API_KEY'),
    langfuse: isPresent('LANGFUSE_SECRET_KEY'),
    orchestratorEngine:
      process.env.STAYSCOUT_ORCHESTRATOR === 'langgraph' ? 'langgraph' : 'hand-rolled',
    providers: {
      bookingCom: isPresent('BOOKING_COM_AFFILIATE_ID') && isPresent('BOOKING_COM_API_KEY'),
      expedia: isPresent('EXPEDIA_API_KEY') && isPresent('EXPEDIA_SHARED_SECRET'),
    },
  };
}
