import type { NextRequest } from 'next/server';
import { ConciergeRequestBodySchema, type ConciergeRequest } from '@core/concierge-request';
import { getOrchestrator } from '@/orchestrator/singleton';
import { toJsonlStream } from '@lib/streaming/jsonl-stream';
import { resolveSession, setSessionCookieHeader } from '@lib/session/anonymous';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    console.warn('[concierge] invalid JSON body');
    return Response.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  // Body schema is lenient on sessionId - the route fills it in from
  // the cookie session before passing the canonical ConciergeRequest
  // shape to the orchestrator.
  const parsed = ConciergeRequestBodySchema.safeParse(body);
  if (!parsed.success) {
    console.warn('[concierge] request failed schema validation', {
      issues: parsed.error.issues.slice(0, 3),
    });
    return Response.json(
      { error: 'invalid request', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // Cookie session is canonical; body is a hint. Middleware mints +
  // propagates so by the time we reach this handler the cookie should
  // be present, but `resolveSession` mints if not (defense-in-depth).
  const session = resolveSession(req.headers.get('cookie'));
  const requestSessionId = parsed.data.sessionId || session.sessionId;

  // Construct the canonical request - sessionId guaranteed to be a
  // string from here on. Spread + override would still TS-widen to
  // `string | undefined`; explicit shape keeps it clean.
  const conciergeRequest: ConciergeRequest = {
    sessionId: requestSessionId,
    turnId: parsed.data.turnId,
    type: parsed.data.type,
    input: parsed.data.input,
    clientCapabilities: parsed.data.clientCapabilities,
    ...(parsed.data.cancelPriorTurn !== undefined
      ? { cancelPriorTurn: parsed.data.cancelPriorTurn }
      : {}),
  };

  console.info('[concierge] incoming turn', {
    turnId: conciergeRequest.turnId,
    type: conciergeRequest.type,
    sessionId: requestSessionId.slice(0, 16),
    rawInputLen: conciergeRequest.input.rawInput.length,
  });

  const orchestrator = await getOrchestrator();
  const stream = toJsonlStream(orchestrator.run(conciergeRequest, { signal: req.signal }));

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-store, no-cache',
    'X-Accel-Buffering': 'no',
  };
  // Middleware is the primary cookie minter; the route only sets a
  // cookie if for some reason the cookie didn't reach us. Guards
  // against routes that bypass middleware (e.g. API rewrites).
  if (session.isNew) {
    headers['Set-Cookie'] = setSessionCookieHeader(requestSessionId);
  }

  return new Response(stream, { headers });
}
