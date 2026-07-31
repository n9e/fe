import { hasActionableRows, pickPrimaryRow } from './visibility';

describe('hasActionableRows', () => {
  it('shows both variants while the main loop is unfinished', () => {
    const rows = [{ done: false, optional: true }, { done: false }, { done: false }, { done: false }];
    expect(hasActionableRows('inline', rows)).toBe(true);
    expect(hasActionableRows('compact', rows)).toBe(true);
  });

  it('hides the inline strip once the main loop is done, so it does not nag forever', () => {
    // 「配置采集」是本地标记，多数用户永远不会点，不能让它把常驻的工具栏引导一直挂在页面上
    const rows = [{ done: false, optional: true }, { done: true }, { done: true }, { done: true }];
    expect(hasActionableRows('inline', rows)).toBe(false);
  });

  it('keeps the compact card when only the optional row is left', () => {
    // 回归防护：老用户装第二台机器时，安装成功态原本有「下一步：配置采集」，
    // 按 inline 的规则判断会把这块渲染成空白
    const rows = [{ done: false, optional: true }, { done: true }, { done: true }, { done: true }];
    expect(hasActionableRows('compact', rows)).toBe(true);
  });

  it('hides both variants when literally everything is done', () => {
    const rows = [{ done: true, optional: true }, { done: true }, { done: true }];
    expect(hasActionableRows('inline', rows)).toBe(false);
    expect(hasActionableRows('compact', rows)).toBe(false);
  });

  it('treats an empty row list as nothing to show', () => {
    expect(hasActionableRows('inline', [])).toBe(false);
    expect(hasActionableRows('compact', [])).toBe(false);
  });

  it('ignores optional rows for the inline strip even when several are pending', () => {
    expect(
      hasActionableRows('inline', [
        { done: false, optional: true },
        { done: false, optional: true },
      ]),
    ).toBe(false);
  });
});

describe('pickPrimaryRow', () => {
  it('skips a pending optional row and picks the first pending mandatory one', () => {
    const rows = [
      { key: 'collect', done: false, optional: true },
      { key: 'pack', done: false },
      { key: 'notify', done: false },
    ] as const;
    expect(pickPrimaryRow([...rows])?.key).toBe('pack');
  });

  it('skips rows that are already done', () => {
    const rows = [
      { key: 'pack', done: true },
      { key: 'notify', done: true },
      { key: 'test', done: false },
    ] as const;
    expect(pickPrimaryRow([...rows])?.key).toBe('test');
  });

  it('returns undefined exactly when the inline strip would be hidden', () => {
    // 两个判定必须同进同退：有主按钮才渲染，渲染了就一定有主按钮
    const rows = [{ done: false, optional: true }, { done: true }];
    expect(hasActionableRows('inline', rows)).toBe(false);
    expect(pickPrimaryRow(rows)).toBeUndefined();
  });
});
