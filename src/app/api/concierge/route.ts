import type { NextRequest } from 'next/server';
import { ConciergeRequestSchema } from '@core/concierge-request';
import { getOrchestrator } from '@/orchestrator/singleton';
import { toJsonlStream } from '@lib/streaming/jsonl-stream';
import { resolveSession, setSessionCookieHeader } from '@lib/session/anonymous';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const parsed = ConciergeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'invalid request', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // Resolve session from cookie (or mint a new one). Slice A is loose;
  // Slice B can tighten with signed cookies + stronger validation.
  const session = resolveSession(req.headers.get('cookie'));
  const requestSessionId = parsed.data.sessionId || session.sessionId;

  const orchestrator = await getOrchestrator();
  const stream = toJsonlStream(
    orchestrator.run({ ...parsed.data, sessionId: requestSessionId }, { signal: req.signal }),
  );

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-store, no-cache',
    'X-Accel-Buffering': 'no',
  };
  if (session.isNew) {
    headers['Set-Cookie'] = setSessionCookieHeader(requestSessionId);
  }

  return new Response(stream, { headers });
}
