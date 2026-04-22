import * as fs from 'fs';
import * as path from 'path';

describe('SideMenu hover panel styles', () => {
  it('lets the hover panel header title inherit color from the panel root in both themes', () => {
    const lessPath = path.join(__dirname, 'menu.less');
    const content = fs.readFileSync(lessPath, 'utf8');

    expect(content).not.toMatch(/\.sidemenu-hover-panel--light\s+\.sidemenu-hover-panel-header-title\s*\{[^}]*color\s*:/);
    expect(content).not.toMatch(/\.sidemenu-hover-panel--on-dark\s+\.sidemenu-hover-panel-header-title\s*\{[^}]*color\s*:/);

    expect(content).toMatch(/\.sidemenu-hover-panel--light\s*\{[^}]*color:\s*var\(--fc-text-1\);/);
    expect(content).toMatch(/\.sidemenu-hover-panel--on-dark\s*\{[^}]*color:\s*#e6e6e8;/);
  });
});
