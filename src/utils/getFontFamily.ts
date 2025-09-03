const NORMAL_FONT_FAMILY = '"Microsoft Yahei",Verdana,Helvetica Neue,sans-serif,PingFangSC-Regular,simsun,"sans-serif"';
const ENT_FONT_FAMILY = 'Helvetica Neue,sans-serif,PingFangSC-Regular,microsoft yahei ui,microsoft yahei,simsun,"sans-serif"';

export default function getFontFamily(customFont?: string) {
  const IS_ENT = import.meta.env.VITE_IS_ENT === 'true';
  let fontFamily = NORMAL_FONT_FAMILY;
  if (IS_ENT) {
    fontFamily = ENT_FONT_FAMILY;
  }
  return customFont || fontFamily;
}

export function getFontFamilyByEnv(isEnt) {
  let fontFamily = NORMAL_FONT_FAMILY;
  if (isEnt) {
    fontFamily = ENT_FONT_FAMILY;
  }
  return fontFamily;
}
