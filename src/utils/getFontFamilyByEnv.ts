import { NORMAL_FONT_FAMILY, ENT_FONT_FAMILY } from './fontFamilyConstant';

export default function getFontFamilyByEnv(isEnt) {
  let fontFamily = NORMAL_FONT_FAMILY;
  if (isEnt) {
    fontFamily = ENT_FONT_FAMILY;
  }
  return fontFamily;
}
