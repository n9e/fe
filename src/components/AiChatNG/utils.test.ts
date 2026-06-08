import { applyStreamChunk } from './utils';
import { IAiChatStreamChunk, IAiChatStreamSegment } from './types';

function seg(kind: 'thinking' | 'text', content: string, done: boolean): IAiChatStreamSegment {
  return { kind, content, done };
}

function chunk(type: string, delta?: string): IAiChatStreamChunk {
  return { type, delta };
}

describe('applyStreamChunk', () => {
  describe('同类追加', () => {
    it('thinking 帧追加到未收口 thinking 段', () => {
      const segments = [seg('thinking', '第一步思考', false)];
      const result = applyStreamChunk(segments, chunk('thinking', '第二步思考'));
      expect(result).toEqual([seg('thinking', '第一步思考第二步思考', false)]);
    });

    it('text 帧追加到未收口 text 段', () => {
      const segments = [seg('text', '第一句', false)];
      const result = applyStreamChunk(segments, chunk('text', '第二句'));
      expect(result).toEqual([seg('text', '第一句第二句', false)]);
    });
  });

  describe('类型切换开新段', () => {
    it('thinking 后跟 text → 收口 thinking、开新 text 段', () => {
      const segments = [seg('thinking', '思考内容', false)];
      const result = applyStreamChunk(segments, chunk('text', '正文'));
      expect(result).toEqual([seg('thinking', '思考内容', true), seg('text', '正文', false)]);
    });

    it('text 后跟 thinking → 收口 text、开新 thinking 段', () => {
      const segments = [seg('text', '过渡语', false)];
      const result = applyStreamChunk(segments, chunk('thinking', '新一轮思考'));
      expect(result).toEqual([seg('text', '过渡语', true), seg('thinking', '新一轮思考', false)]);
    });
  });

  describe('step 帧收口', () => {
    it('step 帧收口当前未完成段', () => {
      const segments = [seg('thinking', '第一轮思考', false)];
      const result = applyStreamChunk(segments, chunk('step'));
      expect(result).toEqual([seg('thinking', '第一轮思考', true)]);
    });

    it('step 后 thinking 帧开新段', () => {
      const segments = [seg('thinking', '第一轮思考', true)];
      const result = applyStreamChunk(segments, chunk('thinking', '第二轮思考'));
      expect(result).toEqual([seg('thinking', '第一轮思考', true), seg('thinking', '第二轮思考', false)]);
    });
  });

  describe('连续 step', () => {
    it('连续多个 step 不产生副作用', () => {
      const segments = [seg('thinking', '思考', true)];
      const afterStep1 = applyStreamChunk(segments, chunk('step'));
      const afterStep2 = applyStreamChunk(afterStep1, chunk('step'));
      expect(afterStep2).toEqual([seg('thinking', '思考', true)]);
    });
  });

  describe('空 delta', () => {
    it('空 delta 不追加也不开新段', () => {
      const segments = [seg('thinking', '已有内容', false)];
      const result = applyStreamChunk(segments, { type: 'thinking', delta: '' });
      expect(result).toEqual([seg('thinking', '已有内容', false)]);
    });
  });

  describe('多轮完整序列', () => {
    it('思考₁ → step → 思考₂ → 正文 → response(忽略)', () => {
      let segments: IAiChatStreamSegment[] = [];

      // 第1轮思考
      segments = applyStreamChunk(segments, chunk('thinking', '先查告警规则'));
      expect(segments).toEqual([seg('thinking', '先查告警规则', false)]);

      // step 边界
      segments = applyStreamChunk(segments, chunk('step'));
      expect(segments).toEqual([seg('thinking', '先查告警规则', true)]);

      // 第2轮思考
      segments = applyStreamChunk(segments, chunk('thinking', '结果显示有3条'));
      expect(segments).toEqual([seg('thinking', '先查告警规则', true), seg('thinking', '结果显示有3条', false)]);

      // 正文
      segments = applyStreamChunk(segments, chunk('text', '共有3条规则'));
      expect(segments).toEqual([seg('thinking', '先查告警规则', true), seg('thinking', '结果显示有3条', true), seg('text', '共有3条规则', false)]);

      // response 帧应忽略
      segments = applyStreamChunk(segments, { type: 'response', content: '{"cards":[]}' });
      expect(segments).toEqual([seg('thinking', '先查告警规则', true), seg('thinking', '结果显示有3条', true), seg('text', '共有3条规则', false)]);
    });
  });

  describe('重放幂等', () => {
    it('相同输入多次调用产生相同输出', () => {
      const input: IAiChatStreamSegment[] = [];
      const chunks: IAiChatStreamChunk[] = [chunk('thinking', '思考'), chunk('step'), chunk('text', '回答')];

      const run1 = chunks.reduce((segs, c) => applyStreamChunk(segs, c), input);
      const run2 = chunks.reduce((segs, c) => applyStreamChunk(segs, c), [] as IAiChatStreamSegment[]);
      expect(run1).toEqual(run2);
    });
  });

  describe('空 segments 起始', () => {
    it('从空数组开始收到 thinking 帧', () => {
      const result = applyStreamChunk([], chunk('thinking', '第一段思考'));
      expect(result).toEqual([seg('thinking', '第一段思考', false)]);
    });

    it('从空数组开始收到 step 帧不产生段', () => {
      const result = applyStreamChunk([], chunk('step'));
      expect(result).toEqual([]);
    });
  });
});
