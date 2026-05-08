import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type {
  GenerateRequest,
  ModelClient,
  ModelMessage,
  StreamChunk,
  StreamRequest,
} from '@core/model-client';

// Anthropic's messages API only accepts 'user' / 'assistant' roles. Our
// ModelMessage interface allows 'system' for ergonomics, but in practice
// system content travels via the top-level `system` field. We drop any
// 'system'-roled messages here — IntentAgent and friends always pass
// system text via req.system anyway.
function toMessageParams(messages: readonly ModelMessage[]): Anthropic.MessageParam[] {
  return messages
    .filter(
      (m): m is { role: 'user' | 'assistant'; content: string } =>
        m.role === 'user' || m.role === 'assistant',
    )
    .map((m) => ({ role: m.role, content: m.content }));
}

export class AnthropicClientError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = 'AnthropicClientError';
  }
}

/**
 * AnthropicModelClient — implementation of the ModelClient interface backed
 * by @anthropic-ai/sdk. Slice A4. Slice B can wrap with a RoutedModelClient
 * that picks providers per-agent.
 *
 * - generate<T>: uses tool-use to enforce structured output when a
 *   responseSchema is provided; otherwise returns the assistant text cast
 *   to T (callers should set T = string).
 * - stream: adapts the SDK's stream events into our StreamChunk union for
 *   the orchestrator's JSONL pipeline (Slice A5).
 *
 * Prompt caching: the system text is wrapped in a single content block with
 * cache_control: ephemeral so the system prompt + few-shots are reused
 * across turns. Cache hits show up in the StreamChunk.finish.usage
 * .cacheHitTokens.
 */
export class AnthropicModelClient implements ModelClient {
  private readonly client: Anthropic;

  constructor(opts: { apiKey?: string } = {}) {
    const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new AnthropicClientError(
        'ANTHROPIC_API_KEY is not set. Add it to your .env or pass via opts.apiKey.',
      );
    }
    this.client = new Anthropic({ apiKey });
  }

  async generate<T>(req: GenerateRequest<T>): Promise<T> {
    const systemBlocks = req.system
      ? [
          {
            type: 'text' as const,
            text: req.system,
            cache_control: { type: 'ephemeral' as const },
          },
        ]
      : undefined;

    // Tool-use path — enforces a JSON Schema output and returns the parsed
    // argument validated against the user's Zod schema.
    if (req.responseSchema) {
      const jsonSchema = z.toJSONSchema(req.responseSchema, {
        target: 'draft-7',
      }) as Record<string, unknown>;

      const tool = {
        name: 'emit_structured_output',
        description: 'Emit the structured output that satisfies the schema.',
        input_schema: { ...jsonSchema, type: 'object' as const },
      };

      try {
        const resp = await this.client.messages.create({
          model: req.model,
          ...(systemBlocks ? { system: systemBlocks } : {}),
          messages: toMessageParams(req.messages),
          tools: [tool],
          tool_choice: { type: 'tool', name: tool.name },
          max_tokens: req.maxTokens ?? 1024,
          ...(req.temperature !== undefined ? { temperature: req.temperature } : {}),
        });

        const toolUse = resp.content.find(
          (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
        );
        if (!toolUse) {
          throw new AnthropicClientError(
            `Model did not emit the expected tool_use block. Response: ${JSON.stringify(resp.content).slice(0, 400)}`,
          );
        }

        const parsed = req.responseSchema.safeParse(toolUse.input);
        if (!parsed.success) {
          throw new AnthropicClientError(
            `Tool output failed schema validation: ${parsed.error.message}`,
          );
        }
        return parsed.data;
      } catch (err) {
        if (err instanceof AnthropicClientError) throw err;
        throw new AnthropicClientError('Anthropic generate() failed', err);
      }
    }

    // Plain text path — returns the assistant's first text block as T.
    try {
      const resp = await this.client.messages.create({
        model: req.model,
        ...(systemBlocks ? { system: systemBlocks } : {}),
        messages: toMessageParams(req.messages),
        max_tokens: req.maxTokens ?? 1024,
        ...(req.temperature !== undefined ? { temperature: req.temperature } : {}),
      });
      const textBlock = resp.content.find(
        (block): block is Anthropic.TextBlock => block.type === 'text',
      );
      return (textBlock?.text ?? '') as T;
    } catch (err) {
      throw new AnthropicClientError('Anthropic generate() failed', err);
    }
  }

  async *stream(req: StreamRequest): AsyncIterable<StreamChunk> {
    const systemBlocks = req.system
      ? [
          {
            type: 'text' as const,
            text: req.system,
            cache_control: { type: 'ephemeral' as const },
          },
        ]
      : undefined;

    const stream = this.client.messages.stream({
      model: req.model,
      ...(systemBlocks ? { system: systemBlocks } : {}),
      messages: toMessageParams(req.messages),
      max_tokens: req.maxTokens ?? 1024,
      ...(req.temperature !== undefined ? { temperature: req.temperature } : {}),
    });

    try {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield { kind: 'text', text: event.delta.text };
        }
      }
      const final = await stream.finalMessage();
      const reason: 'end_turn' | 'max_tokens' | 'error' =
        final.stop_reason === 'max_tokens' ? 'max_tokens' : 'end_turn';
      const cacheHit = final.usage.cache_read_input_tokens;
      const usage = {
        inputTokens: final.usage.input_tokens,
        outputTokens: final.usage.output_tokens,
        ...(cacheHit !== null && cacheHit !== undefined ? { cacheHitTokens: cacheHit } : {}),
      };
      yield { kind: 'finish', reason, usage };
    } catch (err) {
      yield { kind: 'finish', reason: 'error' };
      throw new AnthropicClientError('Anthropic stream() failed', err);
    }
  }
}
