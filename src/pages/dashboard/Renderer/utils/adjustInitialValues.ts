import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

import { DatasourceCateEnum } from '@/utils/constant';
import { IVariable } from '@/pages/dashboard/Variables/types';

import { defaultCustomValuesMap, defaultOptionsValuesMap } from '../../Editor/config';
import { sortPanelsByGridLayout } from '../../Panels/utils';

import getDefaultTargets from '../../utils/getDefaultTargets';

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
  if (lastPanel) {
    if (lastPanel.datasourceCate) {
      datasourceCate = lastPanel.datasourceCate;
    }
  } else {
    const datasourceVar = _.find(variables, { type: 'datasource' });
    if (datasourceVar) {
      datasourceCate = datasourceVar.definition;
    }
  }

  return {
    visible: true,
    id: uuidv4(),
    initialValues: {
      name: 'Panel Title',
      type,
      datasourceCate,
      datasourceValue: getDefaultDatasourceValue(datasourceCate, variables, groupedDatasourceList),
      targets: getDefaultTargets(datasourceCate as DatasourceCateEnum),
      custom: defaultCustomValuesMap[type],
      options: defaultOptionsValuesMap[type],
    },
  };
};

export default adjustInitialValues;
