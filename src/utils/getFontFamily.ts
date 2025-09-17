import { NORMAL_FONT_FAMILY, ENT_FONT_FAMILY } from './fontFamilyConstant';

export default function getFontFamily(customFont?: string) {
  const IS_ENT = import.meta.env.VITE_IS_ENT === 'true';
  let fontFamily = NORMAL_FONT_FAMILY;
  if (IS_ENT) {
    fontFamily = ENT_FONT_FAMILY;
  }
  return customFont || fontFamily;
}
