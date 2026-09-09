import { readFileSync } from 'fs';
import path from 'path';

const businessGroupSource = readFileSync(path.resolve(__dirname, '../index.tsx'), 'utf8');
const businessGroupStyle = readFileSync(path.resolve(__dirname, '../style.less'), 'utf8');
const defaultThemeStyle = readFileSync(path.resolve(__dirname, '../../../theme/default.less'), 'utf8');
const darkThemeStyle = readFileSync(path.resolve(__dirname, '../../../theme/default.dark.less'), 'utf8');

describe('BusinessGroup scrollbar style', () => {
  it('reuses the shared best-looking-scroll utility in the business group list', () => {
    expect(businessGroupSource).toContain('best-looking-scroll overflow-x-hidden overflow-y-auto min-h-0 h-full');
    expect(businessGroupStyle).not.toContain('scrollbar-width: thin;');
  });

  it('keeps the shared scrollbar styling theme-neutral', () => {
    expect(defaultThemeStyle).toContain('.best-looking-scroll {');
    expect(defaultThemeStyle).toContain('background-color: rgba(0, 0, 0, 0.1);');
    expect(defaultThemeStyle).not.toContain('--best-looking-scrollbar-thumb');
    expect(defaultThemeStyle).not.toContain('scrollbar-color:');
    expect(darkThemeStyle).not.toMatch(/\.best-looking-scroll\s*\{/);
  });
});
