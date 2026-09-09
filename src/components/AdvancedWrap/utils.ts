// 数据源分类属于全局配置；保留旧名称与入口，避免既有组件调用路径失效。
export {
  allDatasourceCategories as allCates,
  baseDatasourceCategories as baseCates,
  getAuthorizedDatasourceCategories as getAuthorizedDatasourceCates,
  getDatasourceCategoryByValue as getCateByValue,
  getDatasourceCategoryDisplayLabel as getCateDisplayLabel,
  getDatasourceCategoryGraphPro as getGraphProByCate,
  getDatasourceCategoryPrimaryType as getPrimaryTypeByCate,
} from '@/utils/datasourceRegistry';
export type { DatasourceCategory as Cate } from '@/utils/datasourceRegistry';
