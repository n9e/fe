import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

import { IVariable } from '@/pages/dashboard/Variables/types';

import { defaultCustomValuesMap, defaultOptionsValuesMap } from '../../Editor/config';
import getDefaultTargets from '../../utils/getDefaultTargets';
import { sortPanelsByGridLayout } from '../../Panels/utils';

const getDefaultDatasourceValue = (datasourceCate, variableConfig, groupedDatasourceList) => {
  const datasourceVars = _.filter(variableConfig, { type: 'datasource' });
  const finded = _.find(datasourceVars, { definition: datasourceCate });
  if (finded) {
    return `\${${finded.name}}`;
  }
  return groupedDatasourceList[datasourceCate]?.[0]?.id;
};

const adjustInitialValues = (type: string, groupedDatasourceList: any, panels: any[], variables?: IVariable[]) => {
  const sortedPanels = sortPanelsByGridLayout(panels);
  const lastPanel = _.last(sortedPanels);
  let datasourceCate = 'prometheus';
  let datasourceValue: number | string | undefined;
  if (lastPanel) {
    if (lastPanel.datasourceCate && lastPanel.datasourceCate !== 'mixed') {
      datasourceCate = lastPanel.datasourceCate;
      datasourceValue = lastPanel.datasourceValue;
    } else {
      const lastQueryTarget = _.findLast(lastPanel.targets, (target: any) => target.kind !== 'expression' && target.__mode__ !== '__expr__');
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
      type,
      datasourceCate,
      datasourceValue,
      targets: getDefaultTargets(datasourceCate as any),
      custom: defaultCustomValuesMap[type],
      options: defaultOptionsValuesMap[type],
    },
  };
};

export default adjustInitialValues;
