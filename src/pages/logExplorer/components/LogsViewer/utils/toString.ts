export default function toString(val: any) {
  if (typeof val === 'string') {
    return val;
  }
  try {
    return JSON.stringify(val);
  } catch (e) {
    return 'unknow';
  }
}
