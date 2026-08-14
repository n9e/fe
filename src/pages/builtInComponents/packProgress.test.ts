import { withPackStep } from './packProgress';

describe('withPackStep', () => {
  it('空进度上记一步', () => {
    expect(withPackStep({}, 'MySQL', 'dashboard')).toEqual({ MySQL: ['dashboard'] });
  });

  it('同一步重复记不会产生重复项', () => {
    const input = { MySQL: ['dashboard'] } as const;
    expect(withPackStep(input, 'MySQL', 'dashboard')).toEqual({ MySQL: ['dashboard'] });
  });

  it('追加不覆盖已有的步骤', () => {
    const input = { MySQL: ['collect'] } as const;
    expect(withPackStep(input, 'MySQL', 'alert')).toEqual({ MySQL: ['collect', 'alert'] });
  });

  it('不影响别的组件', () => {
    const input = { MySQL: ['collect'], Redis: ['dashboard'] } as const;
    expect(withPackStep(input, 'MySQL', 'alert')).toEqual({ MySQL: ['collect', 'alert'], Redis: ['dashboard'] });
  });

  it('剔除不认识的步骤名，避免旧数据把 UI 撑出空条目', () => {
    const input = { MySQL: ['collect', 'firemap', 42] };
    expect(withPackStep(input, 'MySQL', 'alert')).toEqual({ MySQL: ['collect', 'alert'] });
  });

  it('值不是数组的条目整个丢掉', () => {
    const input = { MySQL: 'collect', Redis: ['alert'] };
    expect(withPackStep(input, 'Redis', 'collect')).toEqual({ Redis: ['alert', 'collect'] });
  });

  it('顶层不是对象时按空进度处理', () => {
    expect(withPackStep(null, 'MySQL', 'collect')).toEqual({ MySQL: ['collect'] });
    expect(withPackStep([1, 2], 'MySQL', 'collect')).toEqual({ MySQL: ['collect'] });
  });

  it('ident 为空时只做清洗、不写入', () => {
    const input = { MySQL: ['collect', 'nope'] };
    expect(withPackStep(input, '', 'collect')).toEqual({ MySQL: ['collect'] });
  });

  it('清洗后为空数组的条目不保留', () => {
    const input = { MySQL: ['nope'] };
    expect(withPackStep(input, '', 'collect')).toEqual({});
  });
});
