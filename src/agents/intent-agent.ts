import type { Agent, AgentContext } from '@core/agent';
import { agentId } from '@core/ids';
import { TripIntentSchema, type TripIntent } from '@core/trip-intent';
import { INTENT_SYSTEM_PROMPT, INTENT_FEW_SHOTS } from '@lib/ai/prompts/intent-system';
import { buildComposePrompt, buildRefinePrompt } from '@lib/ai/prompts/intent-refine';

export interface IntentAgentInput {
  rawInput: string;
  priorIntent?: TripIntent;
}

export const INTENT_AGENT_ID = agentId('intent');
export const INTENT_MODEL = 'claude-haiku-4-5';

export const IntentAgent: Agent<IntentAgentInput, TripIntent> = {
  id: INTENT_AGENT_ID,
  name: 'Intent Agent',
  version: '0.1.0',

  async run(input: IntentAgentInput, ctx: AgentContext): Promise<TripIntent> {
    const startedAt = performance.now();

    ctx.emit.progress(input.priorIntent ? 'Adjusting your trip' : 'Reading your trip');

    const userPrompt = input.priorIntent
      ? buildRefinePrompt({ rawInput: input.rawInput, priorIntent: input.priorIntent })
      : buildComposePrompt(input.rawInput);

    const system = `${INTENT_SYSTEM_PROMPT}\n\n${INTENT_FEW_SHOTS}`;

    const intent = await ctx.modelClient.generate({
      model: INTENT_MODEL,
      system,
      messages: [{ role: 'user', content: userPrompt }],
      responseSchema: TripIntentSchema,
      cacheKey: 'intent-extraction-v1',
      maxTokens: 2048,
      temperature: 0.2,
    });

    // Defensive: even though the model emitted a tool_use that the SDK
    // validated against the JSON schema, re-validate against the
    // authoritative Zod schema. zodToJsonSchema can drift across versions.
    const parsed = TripIntentSchema.parse(intent);

    // Hard rule (spec §3.1): rawInput is preserved verbatim, regardless of
    // what the model emitted. Models occasionally rewrite or truncate this
    // field; we own it.
    const result: TripIntent = { ...parsed, rawInput: input.rawInput };

    const durationMs = Math.round(performance.now() - startedAt);
    ctx.traceLogger.recordAgentRun(INTENT_AGENT_ID, input, result, durationMs);

    return result;
  },
};
