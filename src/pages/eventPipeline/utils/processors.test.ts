import { getProcessorType, hasRunnableProcessors } from './processors';
import { DEFAULT_VALUES } from '../constants';

describe('getProcessorType', () => {
  it('读 typ，并兼容旧数据的 type', () => {
    expect(getProcessorType({ typ: 'relabel' } as const)).toBe('relabel');
    expect(getProcessorType({ type: 'callback' } as const)).toBe('callback');
  });

  it('typ 优先于 type', () => {
    expect(getProcessorType({ typ: 'relabel', type: 'callback' } as const)).toBe('relabel');
  });

  it('空值安全', () => {
    expect(getProcessorType(undefined)).toBeUndefined();
    expect(getProcessorType({})).toBeUndefined();
  });
});

describe('hasRunnableProcessors', () => {
  it('每个处理器都选了类型才算可保存', () => {
    expect(hasRunnableProcessors([{ typ: 'relabel' }, { typ: 'callback' }])).toBe(true);
  });

  // 新建页的初始卡片就是这个形状，直接保存会落库一条执行时必然失败的工作流
  it('新建页的默认空卡片不可保存', () => {
    expect(hasRunnableProcessors(DEFAULT_VALUES.processors)).toBe(false);
    expect(hasRunnableProcessors([{}])).toBe(false);
  });

  it('只要有一个没选类型就不可保存', () => {
    expect(hasRunnableProcessors([{ typ: 'relabel' }, {}])).toBe(false);
    expect(hasRunnableProcessors([{ typ: 'relabel' }, { typ: '' }])).toBe(false);
  });

  // 处理器卡片被删光后 processors 为 []，后端 Verify() 允许空数组，
  // 保存出来是一条什么都不做的工作流
  it('一个处理器都没有时不可保存', () => {
    expect(hasRunnableProcessors([])).toBe(false);
    expect(hasRunnableProcessors(undefined)).toBe(false);
  });
});
