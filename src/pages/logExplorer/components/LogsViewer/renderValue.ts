import { FieldValueType } from './types';

/**
 * 划词菜单通过 document mouseup 处理选区；同一字段拆成多行后，每行都会
 * 收到该事件。因此含换行的字符串需作为一个字段组件渲染。
 */
export function shouldRenderMultilineValueAsSingleField(enableTextSelectMenu: boolean | undefined, value: FieldValueType): boolean {
  return enableTextSelectMenu === true && typeof value === 'string' && value.includes('\n');
}
