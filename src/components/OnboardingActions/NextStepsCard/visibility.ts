import _ from 'lodash';

export type NextStepsVariant = 'compact' | 'inline';

export interface NextStepsRowState {
  done: boolean;
  /** 可选步骤：展示但不计入「主线是否跑完」 */
  optional?: boolean;
}

/**
 * 卡片是否还有值得展示的内容。
 *
 * 两种形态刻意不同：
 * - `inline` 常驻在机器列表页的工具栏里，必做项全完成就收起。可选项（配置采集）多数用户永远不会做，
 *   若把它算进来，这一行会永久挂在页面上变成噪声。
 * - `compact` 出现在「机器刚上报 / 采集刚验证通过」的成功态里，只要还有能做的事就要给出口。
 *   这里原本是一个无条件的「下一步：配置采集」按钮，已经跑完主线的老用户装第二台机器时
 *   仍然需要它 —— 按 inline 的规则判断会让那块区域变成一片空白。
 */
export function hasActionableRows(variant: NextStepsVariant, rows: NextStepsRowState[]): boolean {
  if (variant === 'inline') {
    return _.some(rows, (row) => !row.optional && !row.done);
  }
  return _.some(rows, (row) => !row.done);
}

/**
 * inline 形态右侧主按钮对应的行：最靠前的未完成必做项。
 *
 * 只挑必做项，可选项即使排在最前面也不当主按钮 —— 「配置采集」是数据库/中间件才需要的分支，
 * 把它做成唯一的主 CTA 会让新人以为不配就走不下去。
 * hasActionableRows('inline') 为真时必然能挑出一行，两者的判定口径保持一致。
 */
export function pickPrimaryRow<T extends NextStepsRowState>(rows: T[]): T | undefined {
  return _.find(rows, (row) => !row.optional && !row.done);
}
