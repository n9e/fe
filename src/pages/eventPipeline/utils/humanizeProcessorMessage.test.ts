import humanizeProcessorMessage from './humanizeProcessorMessage';

const t = (key: string) => `T(${key})`;

describe('humanizeProcessorMessage', () => {
  // 条件不命中是最常见的正常结果，后端原文却是「失败」，必须翻成人话
  it('translates the standalone drop verdicts in both languages', () => {
    expect(humanizeProcessorMessage('丢弃事件失败', t)).toBe('T(processor_message.drop_miss)');
    expect(humanizeProcessorMessage('drop event failed', t)).toBe('T(processor_message.drop_miss)');
    expect(humanizeProcessorMessage('丢弃事件成功', t)).toBe('T(processor_message.drop_hit)');
    expect(humanizeProcessorMessage('drop event success', t)).toBe('T(processor_message.drop_hit)');
  });

  // 流水线级 node_results 里是用 | 拼起来的多段，实测形如 "drop event failed | no-change"
  it('translates every known segment of a piped message', () => {
    expect(humanizeProcessorMessage('drop event failed | no-change', t)).toBe('T(processor_message.drop_miss) · T(processor_message.no_change)');
  });

  it('keeps unknown segments as-is while translating known ones', () => {
    expect(humanizeProcessorMessage('drop event failed | something new', t)).toBe('T(processor_message.drop_miss) · something new');
  });

  // relabel 的差异串不含 |，且一段都不认识，必须原样透出、不能被切碎或改写
  it('returns diff-style messages untouched', () => {
    const diff = 'tags:["a=1","b=2"]→["b=2","a=1"]; tags_map:{"a":"1"}→{"a":"1"}';
    expect(humanizeProcessorMessage(diff, t)).toBe(diff);
  });

  it('is a no-op on empty input', () => {
    expect(humanizeProcessorMessage('', t)).toBe('');
    expect(humanizeProcessorMessage(undefined, t)).toBeUndefined();
  });
});
