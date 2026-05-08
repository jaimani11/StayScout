import type { GenerateRequest, ModelClient, StreamChunk, StreamRequest } from '@core/model-client';

type GenerateHandler = (req: GenerateRequest<unknown>) => unknown | Promise<unknown>;
type StreamHandler = (req: StreamRequest) => AsyncIterable<StreamChunk>;

/**
 * Test double for ModelClient. Tests configure responses up-front via
 * .respondGenerate()/.respondStream() and assert via .calls.
 */
export class MockModelClient implements ModelClient {
  private generateHandler: GenerateHandler | null = null;
  private streamHandler: StreamHandler | null = null;

  readonly calls: {
    generate: GenerateRequest<unknown>[];
    stream: StreamRequest[];
  } = { generate: [], stream: [] };

  respondGenerate(handler: GenerateHandler): this {
    this.generateHandler = handler;
    return this;
  }

  respondStream(handler: StreamHandler): this {
    this.streamHandler = handler;
    return this;
  }

  reset(): void {
    this.generateHandler = null;
    this.streamHandler = null;
    this.calls.generate.length = 0;
    this.calls.stream.length = 0;
  }

  async generate<T>(req: GenerateRequest<T>): Promise<T> {
    this.calls.generate.push(req as GenerateRequest<unknown>);
    if (!this.generateHandler) {
      throw new Error(
        'MockModelClient: no generate handler configured. Call .respondGenerate(handler) first.',
      );
    }
    const result = await Promise.resolve(this.generateHandler(req as GenerateRequest<unknown>));
    if (req.responseSchema) {
      const parsed = req.responseSchema.safeParse(result);
      if (!parsed.success) {
        throw new Error(`MockModelClient: response failed schema: ${parsed.error.message}`);
      }
      return parsed.data;
    }
    return result as T;
  }

  async *stream(req: StreamRequest): AsyncIterable<StreamChunk> {
    this.calls.stream.push(req);
    if (!this.streamHandler) {
      throw new Error(
        'MockModelClient: no stream handler configured. Call .respondStream(handler) first.',
      );
    }
    yield* this.streamHandler(req);
  }
}
