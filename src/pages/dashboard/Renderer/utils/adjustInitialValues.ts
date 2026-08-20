import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

import { DatasourceCateEnum } from '@/utils/constant';
import type { DashboardDatasource, IPanel } from '@/pages/dashboard/types';
import { IVariable } from '@/pages/dashboard/Variables/types';

import { defaultCustomValuesMap, defaultOptionsValuesMap } from '../../Editor/config';
import getDefaultTargets from '../../utils/getDefaultTargets';
import { sortPanelsByGridLayout } from '../../Panels/utils';

type GroupedDatasourceList = Record<string, DashboardDatasource[]>;
type VisualizationType = keyof typeof defaultCustomValuesMap & keyof typeof defaultOptionsValuesMap;

interface EditorInitialValues {
  visible: boolean;
  id: string;
  initialValues: IPanel;
}

const isVisualizationType = (type: string): type is VisualizationType => type in defaultCustomValuesMap && type in defaultOptionsValuesMap;

const getDefaultDatasourceValue = (datasourceCate: string, variableConfig: IVariable[] | undefined, groupedDatasourceList: GroupedDatasourceList) => {
  const datasourceVars = _.filter(variableConfig, { type: 'datasource' });
  const finded = _.find(datasourceVars, { definition: datasourceCate });
  if (finded) {
    return `\${${finded.name}}`;
  }
  return groupedDatasourceList[datasourceCate]?.[0]?.id;
};

const adjustInitialValues = (type: string, groupedDatasourceList: GroupedDatasourceList, panels: IPanel[], variables?: IVariable[]): EditorInitialValues => {
  const visualizationType: VisualizationType = isVisualizationType(type) ? type : 'timeseries';
  const sortedPanels = sortPanelsByGridLayout(panels);
  const lastPanel = _.last(sortedPanels);
  let datasourceCate = 'prometheus';
  let datasourceValue: number | string | undefined;
  if (lastPanel) {
    if (lastPanel.datasourceCate && lastPanel.datasourceCate !== 'mixed') {
      datasourceCate = lastPanel.datasourceCate;
      datasourceValue = lastPanel.datasourceValue;
    } else {
      const lastQueryTarget = _.findLast(lastPanel.targets, (target) => target.kind !== 'expression' && target.__mode__ !== '__expr__');
      if (lastQueryTarget?.datasource) {
        datasourceCate = lastQueryTarget.datasource.cate;
        datasourceValue = lastQueryTarget.datasource.id;
      }
    }
  } else {
    const datasourceVar = _.find(variables, { type: 'datasource' });
    if (datasourceVar) {
      datasourceCate = datasourceVar.definition;
    }
  }
  datasourceValue = datasourceValue ?? getDefaultDatasourceValue(datasourceCate, variables, groupedDatasourceList);

  return {
    visible: true,
    id: uuidv4(),
    initialValues: {
      name: 'Panel Title',
      type: visualizationType,
      version: '4.0.0',
      id: '',
      description: '',
      layout: { h: 0, w: 0, x: 0, y: 0, i: '' },
      datasourceCate,
      datasourceValue,
      targets: getDefaultTargets(datasourceCate as DatasourceCateEnum),
      custom: defaultCustomValuesMap[visualizationType] as IPanel['custom'],
      options: defaultOptionsValuesMap[visualizationType] as IPanel['options'],
      overrides: [],
    },
  };
};

export default adjustInitialValues;
