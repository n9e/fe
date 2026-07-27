import { AGGR_RULE_ID_CACHE_KEY } from '../constants';
import getFilterByURLQuery from './getFilter';

describe('getFilterByURLQuery', () => {
  const values = new Map<string, string>();

  beforeEach(() => {
    values.clear();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: jest.fn((key: string) => values.get(key) ?? null),
      },
    });
  });

  afterEach(() => {
    delete (globalThis as any).localStorage;
  });

  it('从本地缓存恢复聚合规则，并让 URL 参数优先', () => {
    values.set(AGGR_RULE_ID_CACHE_KEY, '12');

    expect(getFilterByURLQuery({}, undefined, undefined).aggr_rule_id).toBe(12);
    expect(getFilterByURLQuery({ aggr_rule_id: '24' }, undefined, undefined).aggr_rule_id).toBe(24);
  });
});
