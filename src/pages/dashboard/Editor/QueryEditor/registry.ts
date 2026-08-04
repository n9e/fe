import _ from 'lodash';

import type { ITarget } from '@/pages/dashboard/types';
import getDefaultTargets from '@/pages/dashboard/utils/getDefaultTargets';
import { inferTargetResultType } from '@/pages/dashboard/Renderer/datasource/target';
import dashboardDatasourceDefinitions, {
  DASHBOARD_DATASOURCE_CATES,
  getDashboardDatasourceCates,
  type DashboardDatasourceDefinition,
} from '@/pages/dashboard/Renderer/datasource/registry';

import QueryBuilder from './QueryBuilder';

export interface DashboardDatasourceEditorDefinition extends DashboardDatasourceDefinition {
  QueryEditor: typeof QueryBuilder;
  createDefaultTarget: (refId: string, datasourceId: number | string) => ITarget;
}

const dashboardDatasourceEditorDefinitions = Object.keys(dashboardDatasourceDefinitions).reduce<Record<string, DashboardDatasourceEditorDefinition>>((registry, cate) => {
  const definition = dashboardDatasourceDefinitions[cate];
  registry[cate] = {
    ...definition,
    QueryEditor: QueryBuilder,
    createDefaultTarget(refId, datasourceId) {
      const defaultTarget = _.cloneDeep(getDefaultTargets(cate as any)[0] ?? {}) as Partial<ITarget>;
      const registryDefaultTarget = _.cloneDeep(definition.defaultTarget ?? {});
      const target: ITarget = {
        ...defaultTarget,
        ...registryDefaultTarget,
        query: {
          ...(defaultTarget.query ?? {}),
          ...(registryDefaultTarget.query ?? {}),
        },
        refId,
        kind: 'query',
        datasource: {
          cate,
          id: datasourceId,
        },
      };
      target.resultType = inferTargetResultType(target);
      delete target.__mode__;
      return target;
    },
  };
  return registry;
}, {});

export function getDashboardDatasourceDefinition(cate: string) {
  return dashboardDatasourceEditorDefinitions[cate];
}

export function createDashboardQueryTarget(cate: string, datasourceId: number | string, refId: string): ITarget {
  const definition = getDashboardDatasourceDefinition(cate);
  if (definition) {
    return definition.createDefaultTarget(refId, datasourceId);
  }
  return {
    refId,
    kind: 'query',
    datasource: {
      cate,
      id: datasourceId,
    },
    resultType: 'time_series',
  };
}

export { DASHBOARD_DATASOURCE_CATES, getDashboardDatasourceCates };

export default dashboardDatasourceEditorDefinitions;
