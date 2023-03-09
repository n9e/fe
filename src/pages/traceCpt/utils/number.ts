export function toFloatPrecision(number: number, precision: number): number {
  const log10Length = Math.floor(Math.log10(Math.abs(number))) + 1;
  const targetPrecision = precision + log10Length;

  if (targetPrecision <= 0) {
    return Math.trunc(number);
  }

  return Number(number.toPrecision(targetPrecision));
}
