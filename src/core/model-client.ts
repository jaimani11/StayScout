import type { ZodType } from 'zod';

export type ModelId = 'claude-haiku-4-5' | 'claude-sonnet-4-6' | 'claude-opus-4-7' | (string & {}); // future-extensible without losing autocomplete on known IDs

export interface ModelMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GenerateRequest<T> {
  model: ModelId;
  system?: string;
  messages: ModelMessage[];
  responseSchema?: ZodType<T>;
  cacheKey?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface StreamRequest {
  model: ModelId;
  system?: string;
  messages: ModelMessage[];
  cacheKey?: string;
  maxTokens?: number;
  temperature?: number;
}

export type StreamChunk =
  | { kind: 'text'; text: string }
  | {
      kind: 'finish';
      reason: 'end_turn' | 'max_tokens' | 'error';
      usage?: ModelUsage;
    };

export interface ModelUsage {
  inputTokens: number;
  outputTokens: number;
  cacheHitTokens?: number;
}

export interface ModelClient {
  generate<T>(req: GenerateRequest<T>): Promise<T>;
  stream(req: StreamRequest): AsyncIterable<StreamChunk>;
}
