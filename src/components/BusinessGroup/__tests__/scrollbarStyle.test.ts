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

  it('keeps best-looking-scroll transparent until hover across themes', () => {
    expect(defaultThemeStyle).toContain('.best-looking-scroll {');
    expect(defaultThemeStyle).toContain('--best-looking-scrollbar-thumb: color-mix(in srgb, var(--fc-text-1) 22%, transparent);');
    expect(defaultThemeStyle).toContain('scrollbar-color: transparent transparent;');
    expect(defaultThemeStyle).toContain('scrollbar-color: var(--best-looking-scrollbar-thumb) transparent;');
    expect(defaultThemeStyle).toContain('background-color: var(--best-looking-scrollbar-thumb);');
    expect(darkThemeStyle).toMatch(/\.best-looking-scroll[\s\S]*--best-looking-scrollbar-thumb: color-mix\(in srgb, var\(--fc-text-1\) 28%, transparent\);/);
  });
});
