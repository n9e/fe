export default function getFontFamily(isEnt: boolean) {
  let fontFamily = '"Microsoft Yahei",Verdana,Helvetica Neue,sans-serif,PingFangSC-Regular,simsun,"sans-serif"';
  if (isEnt) {
    fontFamily = 'Helvetica Neue,sans-serif,PingFangSC-Regular,microsoft yahei ui,microsoft yahei,simsun,"sans-serif"';
  }
  return fontFamily;
}
