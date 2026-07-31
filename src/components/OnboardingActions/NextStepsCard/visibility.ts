import _ from 'lodash';

export type NextStepsVariant = 'compact' | 'banner';

export interface NextStepsRowState {
  done: boolean;
  /** 可选步骤：展示但不计入「主线是否跑完」 */
  optional?: boolean;
}

/**
 * 卡片是否还有值得展示的内容。
 *
 * 两种形态刻意不同：
 * - `banner` 常驻在机器列表页，必做项全完成就收起。可选项（配置采集）多数用户永远不会做，
 *   若把它算进来，横幅会永久挂在页面上变成噪声。
 * - `compact` 出现在「机器刚上报 / 采集刚验证通过」的成功态里，只要还有能做的事就要给出口。
 *   这里原本是一个无条件的「下一步：配置采集」按钮，已经跑完主线的老用户装第二台机器时
 *   仍然需要它 —— 按 banner 的规则判断会让那块区域变成一片空白。
 */
export function hasActionableRows(variant: NextStepsVariant, rows: NextStepsRowState[]): boolean {
  if (variant === 'banner') {
    return _.some(rows, (row) => !row.optional && !row.done);
  }
  return _.some(rows, (row) => !row.done);
}
