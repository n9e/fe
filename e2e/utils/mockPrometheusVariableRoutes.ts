import type { Page } from '@playwright/test';

export type MockPrometheusSeriesItem = Record<string, string>;

type PrometheusMockConfig = {
  datasourceId: number;
  datasourceName: string;
  series: MockPrometheusSeriesItem[];
};

export type DerivedPrometheusMockData = {
  metricName: string;
  datasource: {
    id: number;
    name: string;
    plugin_type: 'prometheus';
    plugin_type_name: 'Prometheus';
    identifier: string;
  };
  defaultDownstreamLabel: string;
  sampleDownstreamValue: string;
  linkage: {
    upstreamLabel: string;
    downstreamLabel: string;
    upstreamValues: [string, string];
    sampleDownstreamValue: string;
    sampleOtherDownstreamValue: string;
  };
};

export async function mockPrometheusVariableRoutes(page: Page, config: PrometheusMockConfig) {
  const derived = derivePrometheusMockData(config);
  const routePattern = `**/api/**/proxy/${config.datasourceId}/api/v1/**`;

  await page.route('**/api/n9e/datasource/brief**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        err: '',
        dat: [derived.datasource],
      }),
    });
  });

  await page.route(routePattern, async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith('/api/v1/labels')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: getLabelNames(config.series),
        }),
      });
      return;
    }

    if (url.pathname.endsWith('/api/v1/label/__name__/values')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: uniqueValues(config.series, '__name__'),
        }),
      });
      return;
    }

    const labelMatch = url.pathname.match(/\/api\/v1\/label\/([^/]+)\/values$/);
    if (labelMatch) {
      const label = decodeURIComponent(labelMatch[1]);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: uniqueValues(config.series, label),
        }),
      });
      return;
    }

    if (url.pathname.endsWith('/api/v1/series')) {
      const selector = url.searchParams.get('match[]') || '';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: filterSeriesBySelector(config.series, selector),
        }),
      });
      return;
    }

    if (url.pathname.endsWith('/api/v1/query')) {
      const query = url.searchParams.get('query') || '';
      const querySeries = filterSeriesBySelector(config.series, extractSelectorFromQuery(query));
      const time = url.searchParams.get('time') || `${Math.floor(Date.now() / 1000)}`;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: {
            resultType: 'vector',
            result: querySeries.map((item) => ({
              metric: item,
              value: [time, '1'],
            })),
          },
        }),
      });
      return;
    }

    await route.fallback();
  });

  return derived;
}

function derivePrometheusMockData(config: PrometheusMockConfig): DerivedPrometheusMockData {
  const metricName = config.series[0]?.__name__;
  if (!metricName) {
    throw new Error('Mock Prometheus series must include __name__');
  }

  const defaultDownstreamLabel = pickDefaultDownstreamLabel(config.series);
  const sampleDownstreamValue = uniqueValues(config.series, defaultDownstreamLabel)[0];
  if (!sampleDownstreamValue) {
    throw new Error(`Mock Prometheus series must include values for label ${defaultDownstreamLabel}`);
  }

  return {
    metricName,
    datasource: {
      id: config.datasourceId,
      name: config.datasourceName,
      plugin_type: 'prometheus',
      plugin_type_name: 'Prometheus',
      identifier: `${config.datasourceName}-identifier`,
    },
    defaultDownstreamLabel,
    sampleDownstreamValue,
    linkage: deriveLinkageData(config.series),
  };
}

function pickDefaultDownstreamLabel(series: MockPrometheusSeriesItem[]) {
  const candidates = ['ident', 'instance', 'host', 'hostname'];
  for (const label of candidates) {
    if (uniqueValues(series, label).length >= 2) {
      return label;
    }
  }
  throw new Error('Mock Prometheus series must provide a downstream label such as ident or instance');
}

function deriveLinkageData(series: MockPrometheusSeriesItem[]) {
  const labelKeys = Array.from(new Set(series.flatMap((item) => Object.keys(item).filter((key) => key !== '__name__' && item[key] && !String(item[key]).includes(',')))));

  const downstreamCandidates = uniqPreserveOrder(['ident', 'instance', 'host', 'hostname', ...labelKeys]).filter((key) => labelKeys.includes(key));

  for (const downstreamLabel of downstreamCandidates) {
    const downstreamValues = uniqueValues(series, downstreamLabel);
    if (downstreamValues.length < 2) continue;

    for (const upstreamLabel of labelKeys) {
      if (upstreamLabel === downstreamLabel) continue;
      const upstreamValues = uniqueValues(series, upstreamLabel);
      if (upstreamValues.length < 2) continue;

      const mapping = buildMapping(series, upstreamLabel, downstreamLabel);
      const pairs = upstreamValues.map((value) => [value, mapping.get(value) || []] as const).filter(([, options]) => options.length > 0);
      if (pairs.length < 2) continue;

      for (let i = 0; i < pairs.length; i += 1) {
        for (let j = i + 1; j < pairs.length; j += 1) {
          const [firstUpstream, firstOptions] = pairs[i];
          const [secondUpstream, secondOptions] = pairs[j];
          const uniqueSecond = secondOptions.find((value) => !firstOptions.includes(value));
          const firstChoice = firstOptions[0];
          const secondChoice = uniqueSecond || secondOptions[0];
          if (!firstChoice || !secondChoice) continue;
          if (firstChoice === secondChoice && firstOptions.length === secondOptions.length) continue;

          return {
            upstreamLabel,
            downstreamLabel,
            upstreamValues: [firstUpstream, secondUpstream] as [string, string],
            sampleDownstreamValue: firstChoice,
            sampleOtherDownstreamValue: secondChoice,
          };
        }
      }
    }
  }

  throw new Error('Unable to derive linkage data from mock Prometheus series');
}

function getLabelNames(series: MockPrometheusSeriesItem[]) {
  return Array.from(new Set(series.flatMap((item) => Object.keys(item).filter((key) => key !== '__name__')))).sort();
}

function filterSeriesBySelector(series: MockPrometheusSeriesItem[], selector: string) {
  const parsed = parsePrometheusSelector(selector);
  if (!parsed) {
    return series;
  }

  return series.filter((item) => {
    if (parsed.metricName && item.__name__ !== parsed.metricName) {
      return false;
    }

    return Object.entries(parsed.matchers).every(([label, value]) => item[label] === value);
  });
}

function extractSelectorFromQuery(query: string) {
  const trimmed = query.trim();
  if (trimmed.startsWith('last_over_time(') && trimmed.endsWith(')')) {
    const inner = trimmed.slice('last_over_time('.length, -1);
    const rangeStart = inner.lastIndexOf('[');
    return rangeStart >= 0 ? inner.slice(0, rangeStart) : inner;
  }
  return trimmed;
}

function parsePrometheusSelector(selector: string) {
  const trimmed = selector.trim();
  if (!trimmed) {
    return null;
  }

  const matched = trimmed.match(/^([^{\s]+)?(?:\{(.*)\})?$/);
  if (!matched) {
    return null;
  }

  const [, metricName = '', rawMatchers = ''] = matched;
  const matchers = rawMatchers
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, item) => {
      const matcher = item.match(/^([^=!~]+)="([^"]*)"$/);
      if (matcher) {
        acc[matcher[1].trim()] = matcher[2];
      }
      return acc;
    }, {});

  return {
    metricName: metricName.trim(),
    matchers,
  };
}

function buildMapping(series: MockPrometheusSeriesItem[], upstreamLabel: string, downstreamLabel: string) {
  const map = new Map<string, string[]>();
  for (const item of series) {
    const upstream = item[upstreamLabel];
    const downstream = item[downstreamLabel];
    if (!upstream || !downstream) continue;
    const current = map.get(upstream) || [];
    if (!current.includes(downstream)) current.push(downstream);
    map.set(upstream, current.sort());
  }
  return map;
}

function uniqueValues(series: MockPrometheusSeriesItem[], label: string) {
  return Array.from(new Set(series.map((item) => item[label]).filter(Boolean)))
    .map(String)
    .sort();
}

function uniqPreserveOrder(items: string[]) {
  return Array.from(new Set(items));
}
