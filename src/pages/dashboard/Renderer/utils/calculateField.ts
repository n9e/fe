export function calculateVariance(vals: number[]): number {
  if (vals.length < 1) {
    return 0;
  }
  let squareSum = 0;
  let runningMean = 0;
  let nonNullCount = 0;
  for (let i = 0; i < vals.length; i++) {
    const currentValue = vals[i];
    if (currentValue != null) {
      nonNullCount++;
      let _oldMean = runningMean;
      runningMean += (currentValue - _oldMean) / nonNullCount;
      squareSum += (currentValue - _oldMean) * (currentValue - runningMean);
    }
  }
  if (nonNullCount === 0) {
    return 0;
  }
  const variance = squareSum / nonNullCount;
  return variance;
}

export function calculateStdDev(vals: number[]): number {
  return Math.sqrt(calculateVariance(vals));
}
