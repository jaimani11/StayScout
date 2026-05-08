'use client';

import { useCallback, useRef } from 'react';
import { OrchestratorEventSchema } from '@core/orchestrator-event';
import type { ProposalRef } from '@core/partial';
import { useWorkspaceStore } from '../store/workspace-store';

export interface SendArgs {
  rawInput: string;
  type?: 'compose' | 'refine';
  priorProposalRef?: ProposalRef;
}

export interface UseConciergeStream {
  send: (args: SendArgs) => Promise<void>;
  cancel: () => void;
}

export function useConciergeStream(): UseConciergeStream {
  const dispatch = useWorkspaceStore((s) => s.dispatch);
  const beginTurn = useWorkspaceStore((s) => s.beginTurn);
  const sessionId = useWorkspaceStore((s) => s.sessionId);
  const ctrlRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async ({ rawInput, type = 'compose', priorProposalRef }: SendArgs): Promise<void> => {
      ctrlRef.current?.abort();
      const turnId = `t_${crypto.randomUUID()}`;
      const finalSessionId = sessionId ?? `anon_${crypto.randomUUID()}`;

      beginTurn({ turnId, sessionId: finalSessionId, userMessage: rawInput, type });

      const ctrl = new AbortController();
      ctrlRef.current = ctrl;

      try {
        const resp = await fetch('/api/concierge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: finalSessionId,
            turnId,
            type,
            input: {
              rawInput,
              ...(priorProposalRef ? { priorProposalRef } : {}),
            },
            clientCapabilities: {
              supportsAdaptationDelta: true,
              supportsMoodSnapshot: true,
              supportsMemoryHint: true,
            },
          }),
          signal: ctrl.signal,
        });

        if (!resp.ok || !resp.body) {
          dispatch({
            kind: 'turn.failed',
            turnId,
            error: `HTTP ${resp.status}`,
            recoverable: false,
          });
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.trim()) continue;
            let parsed: unknown;
            try {
              parsed = JSON.parse(line);
            } catch {
              continue;
            }
            const result = OrchestratorEventSchema.safeParse(parsed);
            if (result.success) {
              dispatch(result.data);
            } else {
              console.warn('[useConciergeStream] dropped invalid event', parsed);
            }
          }
        }
      } catch (err) {
        if (ctrl.signal.aborted) return;
        dispatch({
          kind: 'turn.failed',
          turnId,
          error: err instanceof Error ? err.message : String(err),
          recoverable: false,
        });
      }
    },
    [dispatch, beginTurn, sessionId],
  );

  const cancel = useCallback((): void => {
    ctrlRef.current?.abort();
  }, []);

  return { send, cancel };
}
