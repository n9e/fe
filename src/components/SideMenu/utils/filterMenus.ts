import { DETAIL_PATH as embeddedProductDetailPath } from '@/pages/embeddedProduct/constants';

import { MenuItem } from '../types';

export function filterMenus(menuList: MenuItem[], perms: string[]): MenuItem[] {
  return menuList
    .map((menu) => {
      const filteredChildren = menu.children
        ?.map((child) => {
          if (child.key.startsWith(`${embeddedProductDetailPath}/`)) {
            return child;
          }
          if (child.type === 'tabs' && child.children) {
            const filteredTabs = child.children.filter((tab) => perms?.includes(tab.key));
            if (filteredTabs.length === 0) return null;
            return { ...child, children: filteredTabs };
          }
          return perms?.includes(child.key) ? child : null;
        })
        .filter(Boolean);

      if (filteredChildren && filteredChildren.length > 0) {
        return { ...menu, children: filteredChildren };
      }
      return null;
    })
    .filter(Boolean) as MenuItem[];
}
