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

  it('defines the submenu text token used by nested menu items', () => {
    const menuListPath = path.join(__dirname, 'MenuList.tsx');
    const variablePath = path.join(__dirname, '../../theme/variable.css');
    const menuListContent = fs.readFileSync(menuListPath, 'utf8');
    const variableContent = fs.readFileSync(variablePath, 'utf8');

    expect(menuListContent).toContain('var(--fc-sidemenu-subitem-text)');
    expect(variableContent).toContain('--fc-sidemenu-subitem-text:');
  });
});
