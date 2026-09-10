import fs from 'fs';
import path from 'path';

/**
 * Asserted against the source text rather than by rendering.
 *
 * The ENT branch is chosen by `IS_ENT`, which reads `import.meta.env` — not
 * something this project's jest transform can evaluate — so rendering the
 * button here would only ever exercise the CE path. What is worth guarding is
 * the shape handed to the chat, and that is legible in the source.
 */
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
  const customBlock = handler.slice(handler.indexOf('custom:'));

  it('forces a drawer overlay so ConfigHost pages on /flashai* can still open chat', () => {
    expect(handler).toMatch(/forceDrawer:\s*true/);
  });

  it('spreads the page params themselves, not the wrapper around them', () => {
    // The chat sends whatever is left in `custom` as page_from.param, a flat bag
    // beside workspace_id and the firemap keys. Spreading `queryPageFrom` whole
    // buried the page's own params one level deeper, where nothing reads them —
    // which is how the metric explorer's data source stopped reaching the model.
    expect(customBlock).toMatch(/\.\.\.\(queryPageFrom\?\.param \?\? \{\}\)/);
    expect(customBlock).not.toMatch(/\.\.\.queryPageFrom\s*,/);
  });

  it('puts the action in the field the chat reads', () => {
    // Spread flat it arrived as a stray `key`, and its `param` overwrote the
    // page's own params.
    expect(customBlock).toMatch(/\.\.\.\(queryAction \? \{ action: queryAction \} : \{\}\)/);
    expect(customBlock).not.toMatch(/\.\.\.queryAction\s*,/);
  });

  it('keeps forceDrawer after the spreads so call sites cannot wipe it', () => {
    const lastSpreadAt = customBlock.lastIndexOf('...(');
    const forceAt = customBlock.search(/forceDrawer:\s*true/);
    expect(lastSpreadAt).toBeGreaterThanOrEqual(0);
    expect(forceAt).toBeGreaterThan(lastSpreadAt);
  });
});
