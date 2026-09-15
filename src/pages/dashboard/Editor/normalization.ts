import type { IPanel, ITarget } from '../types';
import { isElasticsearchLike, normalizeElasticsearchDashboardTargetForPersist } from '@/plugins/elasticsearch/queryNormalization';

/** 在保存面板前清理由不同查询模式遗留的表单字段。 */
export function normalizeDashboardPanelForPersist(panel: IPanel): IPanel {
  return {
    ...panel,
    targets: panel.targets?.map((target: ITarget) => {
      const cate = target.datasource?.cate ?? panel.datasourceCate;
      return isElasticsearchLike(cate) ? normalizeElasticsearchDashboardTargetForPersist(target) : target;
    }),
  };
}
