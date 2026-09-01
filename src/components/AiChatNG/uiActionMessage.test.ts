import { splitUIActionSegments, UIActionCallSegment } from './uiActionMessage';

function action(segments: ReturnType<typeof splitUIActionSegments>, index = 0): UIActionCallSegment {
  const segment = segments.filter((item) => item.kind === 'action')[index];
  if (!segment || segment.kind !== 'action') throw new Error('no action segment at ' + index);
  return segment;
}

describe('splitUIActionSegments', () => {
  it('leaves a reply without an action block as a single text segment', () => {
    const segments = splitUIActionSegments('先看一下日志样例：\n\n- 时间戳在开头\n');

    expect(segments).toEqual([{ kind: 'text', content: '先看一下日志样例：\n\n- 时间戳在开头\n' }]);
  });

  it('pulls the call out and keeps the prose around it', () => {
    const segments = splitUIActionSegments(
      ['我来写这几条规则。', '', '```fc-action', '{"action": "fill_rules", "args": {"rules": [{"rule_type": "format"}]}}', '```', '', '写完记得看预览。'].join('\n'),
    );

    expect(segments.map((segment) => segment.kind)).toEqual(['text', 'action', 'text']);
    expect(action(segments).call).toEqual({ name: 'fill_rules', args: { rules: [{ rule_type: 'format' }] } });
    expect(segments[2]).toEqual({ kind: 'text', content: '\n写完记得看预览。' });
  });

  it('marks an unterminated block as open, so half a call is never runnable', () => {
    const segments = splitUIActionSegments(['马上写', '```fc-action', '{"action": "fill_rules", "args": {"rul'].join('\n'));

    expect(action(segments)).toMatchObject({ closed: false, call: null });
  });

  it('accepts the name/arguments spelling the model reaches for anyway', () => {
    const segments = splitUIActionSegments('```fc-action\n{"name": "fill_rules", "arguments": {"rules": []}}\n```');

    expect(action(segments).call).toEqual({ name: 'fill_rules', args: { rules: [] } });
  });

  it('defaults missing args to an empty object', () => {
    const segments = splitUIActionSegments('```fc-action\n{"action": "refresh_preview"}\n```');

    expect(action(segments).call).toEqual({ name: 'refresh_preview', args: {} });
  });

  it('reports a closed block it cannot use, and keeps the raw text to show', () => {
    const segments = splitUIActionSegments('```fc-action\n{"action": "fill_rules",\n```');

    expect(action(segments)).toMatchObject({ closed: true, call: null, raw: '{"action": "fill_rules",' });
    expect(action(segments).error).toBeTruthy();
  });

  it('rejects a block with no action name', () => {
    const segments = splitUIActionSegments('```fc-action\n{"args": {"rules": []}}\n```');

    expect(action(segments)).toMatchObject({ call: null, error: 'missing "action"' });
  });

  it('reads several calls in one reply', () => {
    const segments = splitUIActionSegments(
      ['```fc-action', '{"action": "a", "args": {}}', '```', '然后', '```fc-action', '{"action": "b", "args": {}}', '```'].join('\n'),
    );

    expect(segments.map((segment) => segment.kind)).toEqual(['action', 'text', 'action']);
    expect(action(segments, 1).call?.name).toBe('b');
  });

  it('ignores an ordinary code fence', () => {
    const content = '```json\n{"action": "fill_rules"}\n```';

    expect(splitUIActionSegments(content)).toEqual([{ kind: 'text', content }]);
  });
});
