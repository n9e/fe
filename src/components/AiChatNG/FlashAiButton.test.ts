import fs from 'fs';
import path from 'path';

const source = fs.readFileSync(path.join(__dirname, 'FlashAiButton.tsx'), 'utf8');

function extractUseAiEntClickHandler(code: string): string {
  const start = code.indexOf('function useAiEntClickHandler');
  expect(start).toBeGreaterThanOrEqual(0);
  const callbackStart = code.indexOf('return React.useCallback(() => {', start);
  expect(callbackStart).toBeGreaterThan(start);
  let depth = 0;
  let i = code.indexOf('{', callbackStart);
  for (; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') {
      depth--;
      if (depth === 0) return code.slice(callbackStart, i + 1);
    }
  }
  throw new Error('unclosed useAiEntClickHandler callback');
}

describe('useAiEntClickHandler', () => {
  const handler = extractUseAiEntClickHandler(source);

  it('forces a drawer overlay so ConfigHost pages on /flashai* can still open chat', () => {
    expect(handler).toMatch(/forceDrawer:\s*true/);
  });

  it('keeps forceDrawer after queryAction spread so call sites cannot wipe it', () => {
    const customStart = handler.indexOf('custom:');
    const customBlock = handler.slice(customStart);
    const spreadAt = customBlock.indexOf('...queryAction');
    const forceAt = customBlock.search(/forceDrawer:\s*true/);
    expect(spreadAt).toBeGreaterThanOrEqual(0);
    expect(forceAt).toBeGreaterThan(spreadAt);
  });
});
