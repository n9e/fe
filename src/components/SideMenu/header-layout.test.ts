import * as fs from 'fs';
import * as path from 'path';

describe('SideMenu header layout', () => {
  it('uses a fixed 50px header row instead of margin-y spacing', () => {
    const headerPath = path.join(__dirname, 'Header.tsx');
    const content = fs.readFileSync(headerPath, 'utf8');

    expect(content).toContain('side-menu-collapsed-logo-row relative flex h-[50px] w-full');
    expect(content).toContain('side-menu-logo-row relative flex h-[50px] w-full');
    expect(content).not.toMatch(/side-menu-(collapsed-logo-row|logo-row)[^']*\bmy-/);
  });

  it('draws the menu divider inside the 50px top bar footprint', () => {
    const sideMenuPath = path.join(__dirname, 'index.tsx');
    const content = fs.readFileSync(sideMenuPath, 'utf8');

    expect(content).toContain("'shrink-0 -mt-px h-px'");
  });
});
