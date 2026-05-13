export const SIDE_MENU_COLORS = {
  light: '浅色',
  dark: '深色',
  theme: '主题色',
} as const;

export type SideMenuColors = keyof typeof SIDE_MENU_COLORS;
