export type TargetStatusTone = 'success' | 'warning' | 'error' | 'lost';

export function getUsageStatusTone(value: number, targetUp?: number): TargetStatusTone {
  if (targetUp === 0) return 'lost';
  if (value > 85) return 'error';
  if (value > 70) return 'warning';
  return 'success';
}

export function getOffsetStatusTone(value: number, targetUp?: number): TargetStatusTone {
  if (targetUp === 0) return 'lost';
  if (Math.abs(value) < 1000) return 'success';
  if (Math.abs(value) < 2000) return 'warning';
  return 'error';
}

export function getUpdateAtStatusTone(targetUp?: number): TargetStatusTone {
  if (targetUp === 0) return 'error';
  if (targetUp === 1) return 'warning';
  return 'success';
}

export function getStatusToneStyle(tone: TargetStatusTone) {
  if (tone === 'success') {
    return {
      backgroundColor: 'var(--fc-status-success-bg)',
      color: 'rgb(var(--fc-fill-success-rgb))',
    };
  }

  if (tone === 'warning') {
    return {
      backgroundColor: 'var(--fc-status-warning-bg)',
      color: 'rgb(var(--fc-fill-warning-rgb))',
    };
  }

  if (tone === 'error') {
    return {
      backgroundColor: 'var(--fc-status-error-bg)',
      color: 'rgb(var(--fc-fill-error-rgb))',
    };
  }

  return {
    backgroundColor: 'var(--fc-status-lost-bg)',
    color: 'var(--fc-status-lost-text)',
  };
}
