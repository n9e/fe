export const GUIDE_MODE_KEY = 'privateCloudGuideMode';
export const EMPTY_MODE_KEY = 'privateCloudEmptyMode';
export const HOME_MODE_KEY = 'privateCloudHomeMode';

export type ContentMode = 'show' | 'simplify' | 'hide';

export function parseContentMode(value?: string): ContentMode {
  return value === 'simplify' || value === 'hide' ? value : 'show';
}
