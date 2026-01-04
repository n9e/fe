import _ from 'lodash';

export default function omitUndefinedDeep<T>(val: T): T {
  if (Array.isArray(val)) {
    // Remove undefined entries and clean nested structures inside arrays
    return val.map((item) => omitUndefinedDeep(item)).filter((item) => item !== undefined) as unknown as T;
  }
  if (_.isPlainObject(val)) {
    return _.transform(
      val as Record<string, any>,
      (acc, v, k) => {
        const cleaned = omitUndefinedDeep(v);
        if (cleaned !== undefined) {
          acc[k] = cleaned;
        }
      },
      {},
    ) as unknown as T;
  }
  return val;
}
