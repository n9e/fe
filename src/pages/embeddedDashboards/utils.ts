import type { IRawTimeRange } from '@/components/TimeRangePicker/types';
import moment from 'moment';

const INTERNAL_SEARCH_PARAMS = new Set(['id', 'page', 'viewMode', 'themeMode', '__from', '__to', '__refresh', '__timezone']);

interface AdjustURLOptions {
  range?: IRawTimeRange;
  refreshIntervalSeconds?: number;
  refreshLocalKey?: string;
  windowSearch?: string;
}

const getGrafanaTimeValue = (value: IRawTimeRange['start']) => {
  if (typeof value === 'string' && value.startsWith('now')) {
    return value;
  }

  const parsedValue = moment(value);
  return parsedValue?.isValid() ? parsedValue.valueOf().toString() : undefined;
};

/**
 * 如果 url 里存在 theme:dark | light 参数，则将其替换为当前主题，否则添加当前主题参数。
 * 指定 range 时，使用 Grafana 支持的 from、to 参数同步夜莺的时间范围。
 */
export const adjustURL = (url: string, darkMode: boolean, options: AdjustURLOptions = {}) => {
  const theme = darkMode ? 'dark' : 'light';
  try {
    const urlObj = new URL(url);
    const searchParams = urlObj.searchParams;
    const windowSearchParams = new URLSearchParams(options.windowSearch ?? window.location.search);
    for (const [key, value] of windowSearchParams) {
      if (!INTERNAL_SEARCH_PARAMS.has(key)) {
        searchParams.set(key, value);
      }
    }

    if (options.range) {
      const from = getGrafanaTimeValue(options.range.start);
      const to = getGrafanaTimeValue(options.range.end);
      if (from) {
        searchParams.set('from', from);
      }
      if (to) {
        searchParams.set('to', to);
      }
    }
    if (options.refreshLocalKey) {
      let refreshIntervalSeconds = options.refreshIntervalSeconds;
      const hasInterval = typeof refreshIntervalSeconds === 'number' && refreshIntervalSeconds > 0;
      if (!hasInterval && !windowSearchParams.get('__refresh') && typeof window !== 'undefined') {
        const cachedIntervalSeconds = Number(window.localStorage.getItem(options.refreshLocalKey));
        if (cachedIntervalSeconds > 0) {
          refreshIntervalSeconds = cachedIntervalSeconds;
        }
      }

      if (typeof refreshIntervalSeconds === 'number' && refreshIntervalSeconds > 0) {
        searchParams.set('refresh', `${refreshIntervalSeconds}s`);
      } else {
        searchParams.delete('refresh');
      }
    }
    searchParams.set('theme', theme);

    // URLSearchParams 会把无值的 kiosk 参数序列化为 `kiosk=`；Grafana 的 kiosk
    // 参数无值时应保持只有参数名，有值时则保留该值。
    const search = urlObj.search
      .slice(1)
      .split('&')
      .map((item) => {
        const separatorIndex = item.indexOf('=');
        const key = decodeURIComponent((separatorIndex === -1 ? item : item.slice(0, separatorIndex)).replace(/\+/g, ' '));
        return key === 'kiosk' && separatorIndex !== -1 && item.slice(separatorIndex + 1) === '' ? item.slice(0, separatorIndex) : item;
      })
      .join('&');
    urlObj.search = search;
    return urlObj.toString();
  } catch (e) {
    return url;
  }
};
