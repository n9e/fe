export function normalizeRawValueForNav(rawValue?: Record<string, unknown>): Record<string, unknown> {
  return Object.entries(rawValue || {}).reduce<Record<string, unknown>>((acc, [key, val]) => {
    if (typeof val === 'string') {
      try {
        acc[key] = JSON.parse(val);
      } catch (e) {
        acc[key] = val;
      }
    } else {
      acc[key] = val;
    }
    return acc;
  }, {});
}
