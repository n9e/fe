export default function toString(val: string | number | boolean | object | null | undefined) {
  if (val === undefined) {
    return '';
  }
  if (typeof val === 'string') {
    return val;
  }
  try {
    const serialized = JSON.stringify(val);
    return typeof serialized === 'string' ? serialized : '';
  } catch (e) {
    return 'unknow';
  }
}
