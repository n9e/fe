interface RelativeTimeRange {
  start: number;
  end: number;
}

interface TimeOption {
  start: string;
  end: string;
  display?: string;
}

const regex = /^now$|^now\-(\d{1,10})([wdhms])$/;

export const mapOptionToRelativeTimeRange = (
  option: TimeOption,
):
  | (RelativeTimeRange & {
      cumulative_window_from?: string;
      cumulative_window_to?: string;
    })
  | undefined => {
  // TODO 部分相对时间范围会插入 "今天" 选项，这里单独处理
  if (option.start === 'now/d' && option.end === 'now/d') {
    return {
      start: 0,
      end: 0,
      cumulative_window_from: option.start,
      cumulative_window_to: option.end,
    };
  }
  return {
    start: relativeToSeconds(option.start),
    end: relativeToSeconds(option.end),
  };
};

export const mapRelativeTimeRangeToOption = (
  range: RelativeTimeRange & {
    cumulative_window_from?: string;
    cumulative_window_to?: string;
  },
): TimeOption => {
  if (range.cumulative_window_from && range.cumulative_window_to) {
    return {
      start: range.cumulative_window_from,
      end: range.cumulative_window_to,
      display: `${range.cumulative_window_from} to ${range.cumulative_window_to}`,
    };
  }
  const start = secondsToRelativeFormat(range.start);
  const end = secondsToRelativeFormat(range.end);

  return { start, end, display: `${start} to ${end}` };
};

export type RangeValidation = {
  isValid: boolean;
  errorMessage?: string;
};

export const isRangeValid = (relative: string, now = Date.now()): RangeValidation => {
  if (!isRelativeFormat(relative)) {
    return {
      isValid: false,
      errorMessage: 'Value not in relative time format.',
    };
  }

  const seconds = relativeToSeconds(relative);

  if (seconds > Math.ceil(now / 1000)) {
    return {
      isValid: false,
      errorMessage: 'Can not enter value prior to January 1, 1970.',
    };
  }

  return { isValid: true };
};

export const isRelativeFormat = (format: string): boolean => {
  return regex.test(format);
};

const relativeToSeconds = (relative: string): number => {
  const match = regex.exec(relative);

  if (!match || match.length !== 3) {
    return 0;
  }

  const [, value, unit] = match;
  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    return 0;
  }

  return parsed * units[unit];
};

const units: Record<string, number> = {
  w: 604800,
  d: 86400,
  h: 3600,
  m: 60,
  s: 1,
};

const secondsToRelativeFormat = (seconds: number): string => {
  if (seconds <= 0) {
    return 'now';
  }

  if (seconds >= units.w && seconds % units.w === 0) {
    return `now-${seconds / units.w}w`;
  }

  if (seconds >= units.d && seconds % units.d === 0) {
    return `now-${seconds / units.d}d`;
  }

  if (seconds >= units.h && seconds % units.h === 0) {
    return `now-${seconds / units.h}h`;
  }

  if (seconds >= units.m && seconds % units.m === 0) {
    return `now-${seconds / units.m}m`;
  }

  return `now-${seconds}s`;
};
