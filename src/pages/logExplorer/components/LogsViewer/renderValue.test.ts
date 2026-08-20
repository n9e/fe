/// <reference types="jest" />

import { shouldRenderMultilineValueAsSingleField } from './renderValue';

describe('shouldRenderMultilineValueAsSingleField', () => {
  it('在划词菜单模式下将含换行的字段作为一个整体渲染', () => {
    expect(shouldRenderMultilineValueAsSingleField(true, 'SELECT\nCOUNT(*)')).toBe(true);
  });

  it('未开启划词菜单时仍允许按行渲染', () => {
    expect(shouldRenderMultilineValueAsSingleField(false, 'SELECT\nCOUNT(*)')).toBe(false);
  });

  it('不影响没有换行或非字符串字段的既有渲染方式', () => {
    expect(shouldRenderMultilineValueAsSingleField(true, 'SELECT COUNT(*)')).toBe(false);
    expect(shouldRenderMultilineValueAsSingleField(true, 1)).toBe(false);
  });
});
