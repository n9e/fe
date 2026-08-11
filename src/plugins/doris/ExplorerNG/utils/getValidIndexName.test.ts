import { Field } from '@/pages/logExplorer/types';

import getValidIndexName from './getValidIndexName';

function buildIndexData(fields: string[]): Field[] {
  return fields.map((field) => ({ field, type: 'text', indexable: true }));
}

describe('getValidIndexName', () => {
  describe('flatten 出的非表字段回退到真实字段', () => {
    it('fctags 是 text 列时，fctags.dirname 回退到 fctags', () => {
      const indexData = buildIndexData(['timestamp', 'fctags', 'message']);
      expect(getValidIndexName({ fieldName: 'fctags.dirname', indexData })).toBe('fctags');
    });

    it('多层路径逐级向上回退到最近的真实字段', () => {
      const indexData = buildIndexData(['logRecord.attributes', 'logRecord']);
      expect(getValidIndexName({ fieldName: 'logRecord.attributes.msg.inner', indexData })).toBe('logRecord.attributes');
    });
  });

  describe('VARIANT 子字段是真实字段', () => {
    it('完整路径在 indexData 中时直接返回', () => {
      const indexData = buildIndexData(['fctags', 'fctags.dirname']);
      expect(getValidIndexName({ fieldName: 'fctags.dirname', indexData })).toBe('fctags.dirname');
    });

    it('大小写与日志里的 key 不一致时仍命中，并返回 indexData 中的写法', () => {
      const indexData = buildIndexData(['logrecord.attributes.msg']);
      expect(getValidIndexName({ fieldName: 'logRecord.attributes.msg', indexData })).toBe('logrecord.attributes.msg');
    });
  });

  describe('parentKey 与 fieldName 拼成完整路径', () => {
    it('嵌套渲染传入叶子名时用 parentKey 补全', () => {
      expect(getValidIndexName({ fieldName: 'dirname', parentKey: 'fctags', indexData: buildIndexData(['fctags']) })).toBe('fctags');
    });

    it('补全后的完整路径命中时返回完整路径', () => {
      expect(getValidIndexName({ fieldName: 'dirname', parentKey: 'fctags', indexData: buildIndexData(['fctags.dirname']) })).toBe('fctags.dirname');
    });
  });

  describe('无字段可用', () => {
    it('顶层字段不存在时返回空', () => {
      expect(getValidIndexName({ fieldName: 'unknown', indexData: buildIndexData(['fctags']) })).toBe('');
    });

    it('indexData 为空时返回空', () => {
      expect(getValidIndexName({ fieldName: 'fctags.dirname', indexData: [] })).toBe('');
    });
  });

  describe('普通顶层字段', () => {
    it('直接命中', () => {
      expect(getValidIndexName({ fieldName: 'message', indexData: buildIndexData(['message']) })).toBe('message');
    });
  });
});
