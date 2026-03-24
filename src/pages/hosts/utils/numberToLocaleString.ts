export default function numberToLocaleString(num: number | undefined | null) {
  if (typeof num === 'number') {
    return num.toLocaleString();
  }
  return num ?? '-';
}
