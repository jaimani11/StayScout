/**
 * Convert an AsyncIterable into a JSONL ReadableStream<Uint8Array>. Each
 * yielded value is JSON.stringify'd, terminated by '\n', UTF-8 encoded,
 * and enqueued. Errors thrown by the iterator close the stream with a
 * controller.error() so consumers see the failure.
 */
export function toJsonlStream<T>(iter: AsyncIterable<T>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const value of iter) {
          controller.enqueue(encoder.encode(JSON.stringify(value) + '\n'));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
