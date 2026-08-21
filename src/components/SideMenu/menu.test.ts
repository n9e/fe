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
    expect(lessContent).toMatch(
      /\.side-menu-profile-avatar-on-light\s*\{[\s\S]*?background:\s*var\(--fc-fill-2\);[\s\S]*?border:\s*1px solid rgb\(var\(--fc-text-link-rgb\) \/ 0\.28\);/,
    );
  });

  it('keeps the collapsed hover panel at the same menu level as the expanded side menu', () => {
    const menuListPath = path.join(__dirname, 'MenuList.tsx');
    const menuListContent = fs.readFileSync(menuListPath, 'utf8');

    expect(menuListContent).not.toContain('flattenMenuChildrenForHoverPanel');
    expect(menuListContent).toContain('const hoverChildren = visibleChildren;');
  });

  it('never re-opens the collapsed rail from a menu click', () => {
    const indexPath = path.join(__dirname, 'index.tsx');
    const menuListPath = path.join(__dirname, 'MenuList.tsx');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const menuListContent = fs.readFileSync(menuListPath, 'utf8');

    // The collapse toggle in the header is the only writer, so no click path needs to opt out of expanding.
    expect(indexContent).not.toContain('keepCollapsed');
    expect(menuListContent).not.toContain('keepCollapsed');
    expect(indexContent.match(/localStorage\.setItem\('menuCollapsed'/g)).toHaveLength(1);
    expect(indexContent).toMatch(/const toggleCollapsed = \(\) => \{[\s\S]*?localStorage\.setItem\('menuCollapsed'/);
  });

  it('labels collapsed leaf rows with a tooltip', () => {
    const menuListPath = path.join(__dirname, 'MenuList.tsx');
    const menuListContent = fs.readFileSync(menuListPath, 'utf8');

    // Leaf rows (e.g. FlashAI) render icon-only when collapsed, so the label has to come from a tooltip.
    expect(menuListContent).toContain('function wrapCollapsedRowWithTooltip');
    expect(menuListContent.match(/return wrapCollapsedRowWithTooltip\(row, \{ collapsed, isSub, title: t\(item\.label\) \}\);/g)).toHaveLength(2);
  });

  it('opens the first child when a collapsed group icon is clicked', () => {
    const menuListPath = path.join(__dirname, 'MenuList.tsx');
    const menuListContent = fs.readFileSync(menuListPath, 'utf8');

    // Clicking the icon is the one-step way into a group; hovering stays the way to reach the other children.
    expect(menuListContent).toContain('const collapsedTarget = collapsed ? visibleChildren[0] : undefined;');
    expect(menuListContent).toContain('<Link to={getMenuItemPath(collapsedTarget)}');
    // The hover panel must not stay open on top of the page we just navigated to.
    expect(menuListContent).toMatch(/onClick=\{\(\) => \{[\s\S]{0,160}?if \(!hoverEnabled\) return;\s*closeHoverPanel\(\);/);
  });

  it('clears profile submenus without changing their popup container', () => {
    const indexPath = path.join(__dirname, 'index.tsx');
    const indexContent = fs.readFileSync(indexPath, 'utf8');

    expect(indexContent).not.toContain('getProfileMenuPopupContainer');
    expect(indexContent).toContain('openKeys={profileMenuOpenKeys}');
    expect(indexContent).toContain('onOpenChange={setProfileMenuOpenKeys}');
    expect(indexContent).toMatch(/if \(!open\) \{\s*setProfileMenuOpenKeys\(\[\]\);\s*\}/);
    expect(indexContent).toContain('destroyPopupOnHide');
  });
});
