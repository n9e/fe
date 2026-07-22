import { buildWorkflowName, WorkflowNameTexts } from './buildWorkflowName';

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
});
