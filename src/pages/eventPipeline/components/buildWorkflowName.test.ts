import { buildWorkflowName, truncateName, WorkflowNameTexts } from './buildWorkflowName';
import { MAX_NAME_LENGTH } from '../constants';

const texts = {
  joiner: '-',
  arrow: '→',
  all: '全部告警',
} as const satisfies WorkflowNameTexts;

describe('buildWorkflowName', () => {
  it('过滤与处理器都为空时返回空串', () => {
    expect(buildWorkflowName({}, texts)).toBe('');
    expect(buildWorkflowName({ labelFilters: [{ key: '' }], processorLabels: [] }, texts)).toBe('');
  });

  it('相同入参多次调用结果一致（幂等）', () => {
    const input = { labelFilters: [{ key: 'service', value: 'mon' }], processorLabels: ['标签重写'] } as const;
    expect(buildWorkflowName(input, texts)).toBe(buildWorkflowName(input, texts));
  });

  it('取首个有值的标签过滤条件作为主体', () => {
    expect(buildWorkflowName({ labelFilters: [{ key: 'service', value: 'mon' }], processorLabels: ['标签重写'] }, texts)).toBe('service=mon-标签重写');
  });

  it('标签过滤为空时回退到属性过滤', () => {
    expect(buildWorkflowName({ attrFilters: [{ key: 'group_name', value: 'DefaultBusiGroup' }], processorLabels: ['回调'] }, texts)).toBe('group_name=DefaultBusiGroup-回调');
  });

  it('无过滤条件但有处理器时主体用「全部告警」', () => {
    expect(buildWorkflowName({ processorLabels: ['事件丢弃'] }, texts)).toBe('全部告警-事件丢弃');
  });

  // 新建页默认给一张未选类型的空处理器卡（DEFAULT_VALUES.processors=[{}]），
  // 此时不能凭空造出名字，要让名称留空、由必填校验提示用户
  it('处理器还没选类型时不生成名称', () => {
    expect(buildWorkflowName({ processorLabels: [] }, texts)).toBe('');
    expect(buildWorkflowName({ processorLabels: [undefined as unknown as string] }, texts)).toBe('');
  });

  it('只配了过滤条件、处理器未选类型时只用过滤条件命名', () => {
    expect(buildWorkflowName({ labelFilters: [{ key: 'service', value: 'mon' }], processorLabels: [] }, texts)).toBe('service=mon');
  });

  it('数组值取第一个，多个处理器用箭头连接且最多取 3 个', () => {
    expect(
      buildWorkflowName(
        {
          labelFilters: [{ key: 'app', func: 'in', value: ['a', 'b'] }],
          processorLabels: ['标签重写', '标签丰富', '回调', '事件丢弃'],
        },
        texts,
      ),
    ).toBe('app=a-标签重写→标签丰富→回调');
  });

  it('只有处理器、无 key 的过滤条件被忽略', () => {
    expect(buildWorkflowName({ labelFilters: [{ func: '==', value: 'x' }], processorLabels: ['回调'] }, texts)).toBe('全部告警-回调');
  });

  it('超长的标签值会被截断到后端能存下的长度', () => {
    const result = buildWorkflowName({ labelFilters: [{ key: 'service', value: 'a'.repeat(200) }], processorLabels: ['回调'] }, texts);

    expect(Array.from(result).length).toBe(MAX_NAME_LENGTH);
    expect(result.startsWith('service=aaa')).toBe(true);
  });
});

describe('truncateName', () => {
  it('未超长时原样返回', () => {
    expect(truncateName('service=mon-回调')).toBe('service=mon-回调');
  });

  it('按码点截断，不产生半个代理对', () => {
    // 4 个 emoji 每个占 2 个 UTF-16 码元，按码点截断应得到完整的 2 个
    const result = truncateName('🚀🚀🚀🚀', 2);

    expect(result).toBe('🚀🚀');
    expect(Array.from(result).length).toBe(2);
  });

  it('中文按字符计数，与 MySQL varchar 语义一致', () => {
    expect(truncateName('告'.repeat(200))).toBe('告'.repeat(MAX_NAME_LENGTH));
  });

  it('空值安全', () => {
    expect(truncateName('')).toBe('');
    expect(truncateName(undefined as unknown as string)).toBe('');
  });
});
