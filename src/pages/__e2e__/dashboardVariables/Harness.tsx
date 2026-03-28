import React from 'react';
import _ from 'lodash';
import queryString from 'query-string';
import { Button, Space } from 'antd';
import { useLocation } from 'react-router-dom';

import { CommonStateContext } from '@/App';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import initializeVariablesValue from '@/pages/dashboard/Variables/utils/initializeVariablesValue';
import EditModal from '@/pages/dashboard/Variables/EditModal';
import adjustData from '@/pages/dashboard/Variables/utils/ajustData';
import { formatString } from '@/pages/dashboard/Variables/utils/formatString';

import Variables, { IVariable } from '@/pages/dashboard/Variables';
import { useGlobalState } from '@/pages/dashboard/globalState';

const datasourceList = [
  { id: 1, name: 'prom-1', plugin_type: 'prometheus', plugin_type_name: 'Prometheus', is_default: true, identifier: 'prod-prom' },
  { id: 2, name: 'prom-2', plugin_type: 'prometheus', plugin_type_name: 'Prometheus', is_default: false, identifier: 'staging-prom' },
] as any[];

const groupedDatasourceList = {
  prometheus: datasourceList,
} as any;

const baseVariables: IVariable[] = [
  {
    name: 'const',
    type: 'constant',
    label: 'const',
    definition: 'CONST',
    datasource: { cate: 'prometheus' },
  },
  {
    name: 'input',
    type: 'textbox',
    label: 'input',
    definition: '',
    defaultValue: '',
    datasource: { cate: 'prometheus' },
  },
  {
    name: 'env',
    type: 'custom',
    label: 'env',
    definition: 'prod,dev',
    multi: true,
    allOption: true,
    datasource: { cate: 'prometheus' },
  },
  {
    name: 'ds',
    type: 'datasource',
    label: 'ds',
    definition: 'prometheus',
    regex: '.*',
    datasource: { cate: 'prometheus' },
  },
  {
    name: 'ds_ident',
    type: 'datasourceIdentifier',
    label: 'ds_ident',
    definition: 'prometheus',
    regex: '.*',
    datasource: { cate: 'prometheus' },
  },
  {
    name: 'region',
    type: 'query',
    label: 'region',
    definition: 'label_values(region)',
    datasource: { cate: 'prometheus', value: 1 },
    reg: '/(?<text>\\w+):(?<value>\\d+)/',
  },
  {
    name: 'instance',
    type: 'query',
    label: 'instance',
    definition: 'label_values(up{region="$region"}, instance)',
    datasource: { cate: 'prometheus', value: 1 },
  },
  {
    name: 'host',
    type: 'hostIdent',
    label: 'host',
    definition: '',
    multi: true,
    allOption: true,
    datasource: { cate: 'prometheus' },
  },
];

const promqlTemplates = [
  {
    name: 't0',
    expr: 'up{region="$region",instance="$instance",env=~"$env",const="$const",input="$input"}',
  },
  {
    name: 't1',
    expr: 'sum by (env) (rate(http_requests_total{env=~"$env"}[5m]))',
  },
];

export default function Harness() {
  const location = useLocation();
  const queryParams = React.useMemo(() => queryString.parse(location.search), [location.search]);
  const dashboardId = 1;

  const [, setDashboardMeta] = useGlobalState('dashboardMeta');
  const [variablesWithOptions, setVariablesWithOptions] = useGlobalState('variablesWithOptions');
  const [range, setRange] = useGlobalState('range');
  const initializedRef = React.useRef(false);
  const [editVisible, setEditVisible] = React.useState(false);

  React.useEffect(() => {
    setDashboardMeta({
      id: dashboardId,
      group_id: 1,
      dashboardId: String(dashboardId),
      variableConfigWithOptions: [],
      graphTooltip: 'default',
      graphZoom: 'default',
      public: 0,
      public_cate: 0,
    } as any);
  }, []);

  React.useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const normalized = initializeVariablesValue(_.cloneDeep(baseVariables), queryParams as any, { dashboardId });
    setVariablesWithOptions(normalized);
  }, []);

  const commonState = React.useMemo(
    () =>
      ({
        datasourceCateOptions: [],
        groupedDatasourceList,
        reloadGroupedDatasourceList: async () => {},
        datasourceList,
        setDatasourceList: () => {},
        reloadDatasourceList: async () => {},
        busiGroups: [{ id: 1, name: 'bg' }],
        setBusiGroups: () => {},
        curBusiId: 1,
        setCurBusiId: () => {},
        businessGroup: { id: 1, ids: '1', isLeaf: true },
        setBusiGroup: () => {},
        getVaildBusinessGroup: () => {},
        businessGroupOnChange: () => {},
        profile: { roles: ['Admin'], nickname: 'e2e', username: 'e2e', id: 1 } as any,
        setProfile: () => {},
        licenseExpired: false,
        versions: { version: 'e2e', github_verison: 'e2e', newVersion: false },
        isPlus: false,
        sideMenuBgMode: 'light',
        setSideMenuBgMode: () => {},
        darkMode: false,
        setDarkMode: () => {},
        esIndexMode: 'all',
        dashboardSaveMode: 'manual',
        perms: ['/dashboards/put'],
        installTs: 0,
        logsDefaultRange: { start: 'now-1h', end: 'now' } as IRawTimeRange,
      } as any),
    [],
  );

  return (
    <CommonStateContext.Provider value={commonState}>
      <div className='p-4'>
        <Space>
          <Button
            onClick={() => {
              setRange({ start: 'now-1h', end: 'now' });
            }}
          >
            range:1h
          </Button>
          <Button
            onClick={() => {
              setRange({ start: 'now-6h', end: 'now' });
            }}
          >
            range:6h
          </Button>
          <div data-testid='range'>
            {range.start}~{range.end}
          </div>
        </Space>

        <div className='mt-4' data-testid='variables'>
          <Variables
            queryParams={queryParams as any}
            editable
            onChange={(newVariables) => {
              setVariablesWithOptions(newVariables);
            }}
          />
        </div>

        <Space className='mt-2'>
          <Button data-testid='open-edit' onClick={() => setEditVisible(true)}>
            open-edit
          </Button>
        </Space>

        <EditModal
          visible={editVisible}
          setVisible={setEditVisible}
          onChange={(newVariables) => {
            setVariablesWithOptions(newVariables);
          }}
        />

        <pre className='mt-4 whitespace-pre-wrap' data-testid='variables-json'>
          {JSON.stringify(
            _.map(variablesWithOptions, (v) => ({
              name: v.name,
              type: v.type,
              value: v.value,
              optionsSize: v.options ? v.options.length : 0,
              options: _.map(_.take(v.options, 5), (o) => ({ label: o.label, value: o.value })),
            })),
            null,
            2,
          )}
        </pre>

        <pre className='mt-4 whitespace-pre-wrap' data-testid='saved-config-json'>
          {JSON.stringify(
            _.map(variablesWithOptions, (v) => {
              return _.omit(v as any, ['value', 'options']);
            }),
            null,
            2,
          )}
        </pre>

        <div className='mt-4' data-testid='promql-previews'>
          {_.map(promqlTemplates, (item, idx) => {
            const replaced = formatString(
              item.expr,
              adjustData(variablesWithOptions, {
                datasourceList,
              }),
            );
            return (
              <div key={item.name} className='mb-2'>
                <div data-testid={`promql-template-${idx}`}>{item.expr}</div>
                <pre className='whitespace-pre-wrap' data-testid={`promql-replaced-${idx}`}>
                  {_.toString(replaced)}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </CommonStateContext.Provider>
  );
}
