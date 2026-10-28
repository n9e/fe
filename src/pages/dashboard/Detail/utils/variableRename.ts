import _ from 'lodash';

import { sortPanelsByGridLayout, ajustPanels, processRepeats } from '../../Panels/utils';
import type { IVariable } from '../../Variables/types';
import { renameVariableReferences } from '../../Variables/utils/variableReferences';
import type { IDashboardConfig, IPanel } from '../../types';

/** Prepares the saved config and runtime panel state for a variable rename. */
export function prepareVariableRename(
  config: IDashboardConfig,
  oldName: string,
  newName: string,
  variables: IVariable[],
): { configs: IDashboardConfig; changes: ReturnType<typeof renameVariableReferences>['changes']; panels?: IPanel[] } {
  const { configs, changes } = renameVariableReferences(config, oldName, newName);
  configs.var = _.map(variables, (item) => _.omit(item, ['value', 'options']));

  const panels = configs.panels ? processRepeats(sortPanelsByGridLayout(ajustPanels(configs.panels)), variables, { preserveRowState: false }) : undefined;

  return { configs, changes, panels };
}
