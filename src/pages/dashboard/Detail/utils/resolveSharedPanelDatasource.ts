import _ from 'lodash';

import type { DashboardDatasource, IPanel, ITarget } from '@/pages/dashboard/types';
import { replaceDatasourceVariables } from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

interface ResolvedDatasource {
  cate: string;
  id: number;
  name?: string;
}

export interface SharedPanelDatasource {
  datasourceCate: string;
  datasourceValue?: number | string;
  datasourceName: string;
}

const resolveDatasource = (datasource: { cate: string; id: number | string }, datasourceList: DashboardDatasource[]): ResolvedDatasource | undefined => {
  const id = replaceDatasourceVariables(datasource.id, { datasourceList });
  if (typeof id !== 'number') return undefined;

  const matchedDatasource = _.find(datasourceList, { id });
  return {
    cate: datasource.cate,
    id,
    name: matchedDatasource?.name,
  };
};

/**
 * 临时图没有仪表盘变量运行时，需将面板级数据源解析为可查询的数值 ID。
 * target 级数据源优先；没有 target 数据源时回退到兼容旧配置的面板级数据源。
 */
export function resolveSharedPanelDatasource(
  panel: Pick<IPanel, 'datasourceCate' | 'datasourceValue'>,
  targets: ITarget[],
  datasourceList: DashboardDatasource[],
): SharedPanelDatasource {
  const targetDatasources = _.compact(_.map(targets, (target) => (target.datasource ? resolveDatasource(target.datasource, datasourceList) : undefined)));
  const legacyDatasource =
    panel.datasourceCate && panel.datasourceCate !== 'mixed' && panel.datasourceValue !== undefined
      ? resolveDatasource({ cate: panel.datasourceCate, id: panel.datasourceValue }, datasourceList)
      : undefined;
  const datasources = targetDatasources.length > 0 ? targetDatasources : _.compact([legacyDatasource]);
  const datasourceCates = _.uniq(_.map(datasources, 'cate'));

  return {
    datasourceCate: datasourceCates.length === 1 ? datasourceCates[0] : 'mixed',
    datasourceValue: legacyDatasource?.id ?? panel.datasourceValue,
    datasourceName: _.join(_.uniq(_.compact(_.map(datasources, 'name'))), ', '),
  };
}
