import * as fs from 'fs';
import * as path from 'path';

describe('SideMenu hover panel styles', () => {
  it('uses the submenu text token for the hover panel header title in both themes', () => {
    const lessPath = path.join(__dirname, 'menu.less');
    const content = fs.readFileSync(lessPath, 'utf8');

    expect(content).toContain('.sidemenu-hover-panel--light .sidemenu-hover-panel-header-title');
    expect(content).toContain('color: var(--fc-sidemenu-subitem-text);');
    expect(content).toContain('.sidemenu-hover-panel--on-dark .sidemenu-hover-panel-header-title');
    expect(content).not.toContain('.sidemenu-hover-panel--light .sidemenu-hover-panel-header-title {\n  color: var(--fc-text-1);');
    expect(content).not.toContain('.sidemenu-hover-panel--on-dark .sidemenu-hover-panel-header-title {\n  color: var(--fc-text-2, #e6e6e8);');
  });
});
