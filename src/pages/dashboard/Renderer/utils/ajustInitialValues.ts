import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { defaultCustomValuesMap, defaultOptionsValuesMap } from '../../Editor/config';
import { sortPanelsByGridLayout } from '../../Panels/utils';
import { IVariable } from '../../VariableConfig';

const getDefaultDatasourceValue = (datasourceCate, variableConfig, groupedDatasourceList) => {
  const datasourceVars = _.filter(variableConfig, { type: 'datasource' });
  const finded = _.find(datasourceVars, { definition: datasourceCate });
  if (finded) {
    return `\${${finded.name}}`;
  }
  return groupedDatasourceList[datasourceCate]?.[0]?.id;
};

const ajustInitialValues = (type: string, groupedDatasourceList: any, panels: any[], variableConfig?: IVariable[]) => {
  const sortedPanels = sortPanelsByGridLayout(panels);
  const lastPanel = _.last(sortedPanels);
  let datasourceCate = 'prometheus';
  if (lastPanel) {
    if (lastPanel.datasourceCate) {
      datasourceCate = lastPanel.datasourceCate;
    }
  } else {
    const datasourceVar = _.find(variableConfig, { type: 'datasource' });
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
      datasourceValue: getDefaultDatasourceValue(datasourceCate, variableConfig, groupedDatasourceList),
      targets: [
        {
          refId: 'A',
        },
      ],
      custom: defaultCustomValuesMap[type],
      options: defaultOptionsValuesMap[type],
    },
  };
};

export default ajustInitialValues;
