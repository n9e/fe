/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { TextDecoder, TextEncoder } from 'util';
import { ReadableStream } from 'stream/web';
import { useAiChatStream } from './useStream';

// jsdom has neither the encoders nor web streams; the hook needs both.
Object.assign(global, { TextEncoder, TextDecoder, ReadableStream });

jest.mock('@/App', () => ({ basePrefix: '' }));
jest.mock('@/utils/constant', () => ({ AccessTokenKey: 'access_token', IS_ENT: false }));

function streamOf(entries: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      entries.forEach((entry) => controller.enqueue(encoder.encode(entry)));
      controller.close();
    },
  });
}

it('tells the caller when the connection ends before the finish frame', async () => {
  const onChunk = jest.fn();
  const onFinish = jest.fn();
  const onClose = jest.fn();
  global.fetch = jest.fn().mockResolvedValue({ ok: true, body: streamOf(['data: {"type":"text","delta":"hi"}\n\n']) } as unknown as Response);
  const { result } = renderHook(() => useAiChatStream({ onChunk, onFinish, onClose }));
  await act(async () => {
    await result.current.start('stream-1');
  });
  expect(onChunk).toHaveBeenCalledWith(expect.objectContaining({ delta: 'hi' }));
  expect(onFinish).not.toHaveBeenCalled();
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(result.current.streaming).toBe(false);
});

it('does not report a close after a proper finish', async () => {
  const onFinish = jest.fn();
  const onClose = jest.fn();
  global.fetch = jest.fn().mockResolvedValue({ ok: true, body: streamOf(['event: finish\ndata: null\n\n']) } as unknown as Response);
  const { result } = renderHook(() => useAiChatStream({ onFinish, onClose }));
  await act(async () => {
    await result.current.start('stream-1');
  });
  expect(onFinish).toHaveBeenCalledTimes(1);
  expect(onClose).not.toHaveBeenCalled();
});
