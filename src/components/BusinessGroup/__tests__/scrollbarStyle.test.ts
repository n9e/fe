import { readFileSync } from 'fs';
import path from 'path';

const style = readFileSync(path.resolve(__dirname, '../style.less'), 'utf8');

describe('BusinessGroup scrollbar style', () => {
  it('keeps the business group list scrollbar transparent until hover', () => {
    expect(style).toMatch(/\.n9e-biz-group-container\s*\{[\s\S]*\.scroll-container\s*\{/);
    expect(style).toContain('scrollbar-width: thin;');
    expect(style).toContain('scrollbar-color: transparent transparent;');
    expect(style).toContain('background-color: transparent;');
    expect(style).toContain('--n9e-biz-group-scrollbar-thumb: color-mix(in srgb, var(--fc-text-1) 22%, transparent);');
    expect(style).toContain('scrollbar-color: var(--n9e-biz-group-scrollbar-thumb) transparent;');
    expect(style).toContain('background-color: var(--n9e-biz-group-scrollbar-thumb);');
  });

  it('uses a lighter translucent thumb in dark theme on hover', () => {
    expect(style).toMatch(/\.theme-dark[\s\S]*\.n9e-biz-group-container[\s\S]*\.scroll-container[\s\S]*--n9e-biz-group-scrollbar-thumb: color-mix\(in srgb, var\(--fc-text-1\) 28%, transparent\);/);
  });
});
