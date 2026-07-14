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

  it('gives the footer profile avatar visible contrast on light side menus', () => {
    const indexPath = path.join(__dirname, 'index.tsx');
    const lessPath = path.join(__dirname, 'menu.less');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const lessContent = fs.readFileSync(lessPath, 'utf8');

    expect(indexContent).toContain('side-menu-profile-avatar-on-light');
    expect(indexContent).toContain('side-menu-profile-avatar-on-dark');
    expect(lessContent).toMatch(/\.side-menu-profile-avatar\s*\{[\s\S]*?box-sizing:\s*border-box;/);
    expect(lessContent).toMatch(/\.side-menu-profile-avatar-on-light\s*\{[\s\S]*?background:\s*var\(--fc-fill-2\);[\s\S]*?border:\s*1px solid rgb\(var\(--fc-text-link-rgb\) \/ 0\.28\);/);
  });

  it('keeps the collapsed hover panel at the same menu level as the expanded side menu', () => {
    const menuListPath = path.join(__dirname, 'MenuList.tsx');
    const menuListContent = fs.readFileSync(menuListPath, 'utf8');

    expect(menuListContent).not.toContain('flattenMenuChildrenForHoverPanel');
    expect(menuListContent).toContain('const hoverChildren = visibleChildren;');
  });
});
