import { hasActionableRows } from './visibility';

describe('hasActionableRows', () => {
  it('shows both variants while the main loop is unfinished', () => {
    const rows = [{ done: false, optional: true }, { done: false }, { done: false }, { done: false }];
    expect(hasActionableRows('banner', rows)).toBe(true);
    expect(hasActionableRows('compact', rows)).toBe(true);
  });

  it('hides the banner once the main loop is done, so it does not nag forever', () => {
    // 「配置采集」是本地标记，多数用户永远不会点，不能让它把常驻横幅一直挂在页面上
    const rows = [{ done: false, optional: true }, { done: true }, { done: true }, { done: true }];
    expect(hasActionableRows('banner', rows)).toBe(false);
  });

  it('keeps the compact card when only the optional row is left', () => {
    // 回归防护：老用户装第二台机器时，安装成功态原本有「下一步：配置采集」，
    // 按 banner 的规则判断会把这块渲染成空白
    const rows = [{ done: false, optional: true }, { done: true }, { done: true }, { done: true }];
    expect(hasActionableRows('compact', rows)).toBe(true);
  });

  it('hides both variants when literally everything is done', () => {
    const rows = [{ done: true, optional: true }, { done: true }, { done: true }];
    expect(hasActionableRows('banner', rows)).toBe(false);
    expect(hasActionableRows('compact', rows)).toBe(false);
  });

  it('treats an empty row list as nothing to show', () => {
    expect(hasActionableRows('banner', [])).toBe(false);
    expect(hasActionableRows('compact', [])).toBe(false);
  });

  it('ignores optional rows for the banner even when several are pending', () => {
    expect(hasActionableRows('banner', [{ done: false, optional: true }, { done: false, optional: true }])).toBe(false);
  });
});
